import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";

async function getUser() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    if(!authToken){
        return null;
    }
    const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
            'Cookie': `auth-token=${authToken.value}`,
        },
    });
    if(response.status === 401){
        return null;
    }
    
    return response.json();
}   

export default async function Dashboard() {
    const user = await getUser();
    if(!user){
        return redirect('/signin');
    }

  return <div>Dashboard</div>;  
}