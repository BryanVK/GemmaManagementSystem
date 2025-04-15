import { useState } from "react";
import { OnCall } from "./OnCall";
import { CreateOnCall } from "./CreateOnCall";
import { TaskList } from "./TaskList";

export function Menu() {
    const [activeComponent, setActiveComponent] = useState("OnCall");
    const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col items-start justify-start p-4">
                {/* Tombol Create hanya muncul saat halaman OnCall aktif */}
                {activeComponent === "OnCall" && (
                    <button
                        className="btn btn-outline btn-primary mb-4"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create
                    </button>
                )}

                {/* Menampilkan komponen yang aktif */}
                {activeComponent === "OnCall" && <OnCall />}
                {activeComponent === "Report" && <OnCall/>}
                {activeComponent === "TaskList" && <TaskList/>}

                <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">
                    Open drawer
                </label>
            </div>
            
            {/* Sidebar */}
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 space-y-2">
                    <li className="w-full">
                        <button
                            onClick={() => setActiveComponent("OnCall")}
                            className={`w-full text-left px-4 py-2 rounded-lg transition ${activeComponent === "OnCall" ? "bg-primary text-white font-bold" : "hover:bg-gray-300"}`}
                        >
                            On Call
                        </button>
                    </li>
                    <li className="w-full">
                        <button
                            onClick={() => setActiveComponent("Report")}
                            className={`w-full text-left px-4 py-2 rounded-lg transition ${activeComponent === "Report" ? "bg-primary text-white font-bold" : "hover:bg-gray-300"}`}
                        >
                            Report
                        </button>
                    </li>
                    <li className="w-full">
                        <button
                            onClick={() => setActiveComponent("TaskList")}
                            className={`w-full text-left px-4 py-2 rounded-lg transition ${activeComponent === "TaskList" ? "bg-primary text-white font-bold" : "hover:bg-gray-300"}`}
                        >
                            Task List
                        </button>
                    </li>
                </ul>
            </div>

            {/* Modal untuk CreateOnCall */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm z-50">
                    <CreateOnCall />
                    <div className="flex justify-end mt-4">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}


