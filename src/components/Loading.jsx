
const Loading = () => {
    return (
        <div className="flex items-center justify-center bg-sky-950 h-screen flex-col">
            <div className="border-2 border-white border-t-transparent rounded-full w-16 h-16 animate-spin mx-2"></div>
            <div className="text-2xl font-bold text-white">Cargando...</div>
        </div>
    );
};

export default Loading;