import { useEffect } from 'react';

const useWebSocket = (isShared, socket, listId, setLists, roomCode) => {
    useEffect(() => {
        if (!isShared) return;

        const wsSocket = new WebSocket(`ws://localhost:8000/ws/todolist/${roomCode}/`);

        wsSocket.onopen = () => {
            console.log("WebSocket connected");
        };

        wsSocket.close = () => {
            console.log("Disconnected from WebSocket");
        };
        

        wsSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            setLists(prevLists => {
                return prevLists.map(list => {
                    if (list.id !== listId) return list;

                    if (data.type === "remove_task") {
                        return {
                            ...list,
                            tasks: list.tasks.filter(task => task.id !== data.task_id)
                        };
                    }

                    if (data.type === "toggle_task") {
                        return {
                            ...list,
                            tasks: list.tasks.map(task =>
                                task.id === data.task_id ? { ...task, is_completed: data.is_completed } : task
                            )
                        };
                    }

                    if (data.type === "add_task") {
                        if (!list.tasks.some(task => task.id === data.task.id)) {
                            return {
                                ...list,
                                tasks: [...list.tasks, data.task]
                            };
                        }
                    }

                    return list;
                });
            });
        };

        return () => {
            wsSocket.close();
        };
    }, [isShared, roomCode, listId, setLists]);

    return socket;
};

export default useWebSocket;
