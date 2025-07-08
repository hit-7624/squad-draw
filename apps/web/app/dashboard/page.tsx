import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";


export default function Dashboard() {
    return <div>Dashboard</div>;
}