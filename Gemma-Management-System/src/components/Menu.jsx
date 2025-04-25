import { useState } from "react";
import { OnCall } from "./OnCall";
import { CreateOnCall } from "./CreateOnCall";
import { TaskList } from "./TaskList";
import { AddMachine } from "./AddMachine";
import { AddTeknisi } from "./AddTeknisi";

export function Menu() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const userType = user?.userType;

    const [activeComponent, setActiveComponent] = useState(() => {
        if (userType === "Teknisi") return "TaskList";
        return "OnCall"; // default untuk Admin atau yang lain
    });


    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col items-start justify-start p-4">
                {/* Tombol Create hanya muncul saat halaman OnCall aktif dan user Admin */}
                {activeComponent === "OnCall" && userType === "Admin" && (
                    <button
                        className="btn btn-outline btn-primary mb-4"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create
                    </button>
                )}

                {/* Tampilan berdasarkan userType */}
                {userType === "Admin" && (
                    <>
                        {activeComponent === "OnCall" && <OnCall />}
                        {activeComponent === "Report" && <OnCall />}
                        {activeComponent === "AddMachine" && <AddMachine />}
                        {activeComponent === "AddTeknisi" && <AddTeknisi />}
                    </>
                )}
                {userType === "Teknisi" && activeComponent === "TaskList" && <TaskList />}

                <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">
                    Open drawer
                </label>
            </div>

            {/* Sidebar */}
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 space-y-2">

                    {/* Sidebar untuk Admin */}
                    {userType === "Admin" && (
                        <>
                            <li className="w-full">
                                <button
                                    onClick={() => setActiveComponent("OnCall")}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                        activeComponent === "OnCall"
                                            ? "bg-primary text-white font-bold"
                                            : "hover:bg-gray-300"
                                    }`}
                                >
                                    On Call
                                </button>
                            </li>
                            <li className="w-full">
                                <button
                                    onClick={() => setActiveComponent("Report")}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                        activeComponent === "Report"
                                            ? "bg-primary text-white font-bold"
                                            : "hover:bg-gray-300"
                                    }`}
                                >
                                    Report
                                </button>
                            </li>

                            <li className="w-full">
                                <button
                                    onClick={() => setActiveComponent("AddMachine")}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                        activeComponent === "AddMachine"
                                            ? "bg-primary text-white font-bold"
                                            : "hover:bg-gray-300"
                                    }`}
                                >
                                    Add Machine
                                </button>
                            </li>

                            <li className="w-full">
                                <button
                                    onClick={() => setActiveComponent("AddTeknisi")}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                        activeComponent === "AddTeknisi"
                                            ? "bg-primary text-white font-bold"
                                            : "hover:bg-gray-300"
                                    }`}
                                >
                                    Add Teknisi
                                </button>
                            </li>
                        </>
                    )}

                    {/* Sidebar untuk Teknisi */}
                    {userType === "Teknisi" && (
                        <li className="w-full">
                            <button
                                onClick={() => setActiveComponent("TaskList")}
                                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                    activeComponent === "TaskList"
                                        ? "bg-primary text-white font-bold"
                                        : "hover:bg-gray-300"
                                }`}
                            >
                                Task List
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            {/* Modal CreateOnCall */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
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
                </div>
            )}
        </div>
    );
}
