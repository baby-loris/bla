const queueMicrotask: (callback: VoidFunction) => void = 'queueMicrotask' in window ?
    window.queueMicrotask :
    callback => {
        Promise.resolve()
            .then(callback)
            .catch(err => {
                setTimeout(
                    () => {
                        throw err;
                    },
                    0
                );
            });
    };

export default queueMicrotask;
