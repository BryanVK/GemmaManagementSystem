import logo from "../assets/gp1.jpg";

export function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-sm flex-wrap px-4">
      <div className="flex items-center gap-2 flex-1 overflow-hidden min-w-0">
        <img src={logo} alt="Logo" className="h-10 w-10 shrink-0" />
        <span className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl leading-tight break-words whitespace-normal">
          Paramitra Management System
        </span>
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
  );
}
