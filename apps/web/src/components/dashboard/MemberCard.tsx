import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { OnlineIndicator } from "@/components/ui/OnlineIndicator";
import { Member, Room, User } from "./dashboard.types";

interface MemberCardProps {
  member: Member;
  currentUser: User | null;
  room: Room;
  actionLoading: string | null;
  isOnline: boolean;
  canManageMembers: boolean;
  isOwner: boolean;
  onPromoteToAdmin: (roomId: string, userId: string) => Promise<void>;
  onDemoteFromAdmin: (roomId: string, userId: string) => Promise<void>;
  onKickMember: (roomId: string, userId: string) => Promise<void>;
}

export const MemberCard = ({
  member,
  currentUser,
  room,
  actionLoading,
  isOnline,
  canManageMembers,
  isOwner,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onKickMember
}: MemberCardProps) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'promote' | 'demote' | 'kick' | null;
    title: string;
    message: string;
    confirmText: string;
    variant: 'default' | 'danger';
  }>({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    confirmText: '',
    variant: 'default'
  });

  const isCurrentUser = currentUser?.id === member.id;
  const isMemberOwner = member.id === room.ownerId;
  const isAdmin = member.role === 'ADMIN';
  const isMember = member.role === 'MEMBER';

  const showCannotManageOwner = isMemberOwner && !isCurrentUser;
  const showPromoteButton = canManageMembers && isMember && !isCurrentUser;
  const showDemoteButton = canManageMembers && isAdmin && !isCurrentUser && !isMemberOwner;
  const showKickButton = canManageMembers && !isCurrentUser && !isMemberOwner;

  const handlePromote = () => {
    setModalState({
      isOpen: true,
      type: 'promote',
      title: 'Promote to Admin',
      message: `Are you sure you want to promote ${member.name} to Admin? They will be able to manage other members and room settings.`,
      confirmText: 'Promote',
      variant: 'default'
    });
  };

  const handleDemote = () => {
    setModalState({
      isOpen: true,
      type: 'demote',
      title: 'Demote from Admin',
      message: `Are you sure you want to demote ${member.name} from Admin to Member? They will lose their admin privileges.`,
      confirmText: 'Demote',
      variant: 'default'
    });
  };

  const handleKick = () => {
    setModalState({
      isOpen: true,
      type: 'kick',
      title: 'Kick Member',
      message: `Are you sure you want to kick ${member.name} from the room? They will be removed immediately and won't be able to rejoin unless invited again.`,
      confirmText: 'Kick',
      variant: 'danger'
    });
  };

  const handleConfirm = async () => {
    try {
      if (modalState.type === 'promote') {
        await onPromoteToAdmin(room.id, member.id);
      } else if (modalState.type === 'demote') {
        await onDemoteFromAdmin(room.id, member.id);
      } else if (modalState.type === 'kick') {
        await onKickMember(room.id, member.id);
      }
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-bg-1 rounded-lg border border-border-1 hover:bg-bg-1/80 transition-colors">
        {/* Left side - User info and tags */}
        <div className="flex items-center gap-4">
                      <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <OnlineIndicator isOnline={isOnline} size="sm" />
                  <p className="text-font-1 font-medium text-sm">{member.name}</p>
                </div>
              
              {/* Role tags side by side after username */}
              <div className="flex gap-1.5">
                {isCurrentUser && (
                  <span className="text-xs px-2 py-0.5 bg-custom text-white rounded-full font-medium">You</span>
                )}
                {isMemberOwner && (
                  <span className="text-xs px-2 py-0.5 bg-custom text-white rounded-full font-medium">Owner</span>
                )}
                {isAdmin && !isMemberOwner && (
                  <span className="text-xs px-2 py-0.5 bg-custom/70 text-white rounded-full font-medium">Admin</span>
                )}
                {isMember && (
                  <span className="text-xs px-2 py-0.5 bg-custom/40 text-font-1 rounded-full font-medium">Member</span>
                )}
              </div>
            </div>
            <p className="text-font-3 text-xs">{member.email}</p>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2 ml-4">
          {showCannotManageOwner && (
            <span className="text-xs text-font-3 px-2 py-1 italic">Cannot manage owner</span>
          )}
          
          {showPromoteButton && (
            <Button
              onClick={handlePromote}
              disabled={actionLoading === `promote-${member.id}`}
              size="sm"
              className="bg-tertiary hover:bg-quaternary text-font-1 text-xs px-3 py-1.5 h-auto font-medium transition-colors shadow-sm"
            >
              {actionLoading === `promote-${member.id}` ? "Promoting..." : "Promote"}
            </Button>
          )}

          {showDemoteButton && (
            <Button
              onClick={handleDemote}
              disabled={actionLoading === `demote-${member.id}`}
              size="sm"
              className="bg-custom hover:bg-custom-hover text-white text-xs px-3 py-1.5 h-auto font-medium transition-colors shadow-sm"
            >
              {actionLoading === `demote-${member.id}` ? "Demoting..." : "Demote"}
            </Button>
          )}

          {showKickButton && (
            <Button
              onClick={handleKick}
              disabled={actionLoading === `kick-${member.id}`}
              size="sm"
              className="bg-delete hover:bg-delete-hover text-white text-xs px-3 py-1.5 h-auto font-medium transition-colors shadow-sm"
            >
              {actionLoading === `kick-${member.id}` ? "Kicking..." : "Kick"}
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        variant={modalState.variant}
        onConfirm={handleConfirm}
      />
    </>
  );
}; 