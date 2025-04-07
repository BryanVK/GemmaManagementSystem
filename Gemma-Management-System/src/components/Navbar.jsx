import logo from "../assets/gp1.jpg";

export function Navbar(){
    return(
        <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
            
            <a className="btn btn-ghost text-xl"><img src={logo} alt="Logo" className="h-10 w-10"/>Gemma Paramitra Management System</a>
        </div>
        <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
            <li><a>Notification</a></li>
            <li>
                <details>
                <summary>Profile</summary>
                <ul className="bg-base-100 rounded-t-none p-2">
                    <li><a>Account</a></li>
                    <li><a>Logout</a></li>
                </ul>
                </details>
            </li>
            </ul>
        </div>
        </div>
    )
}
