import { useEffect, useState } from "react";

function timeAgo(date: any) {
    const now: any = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) {
        return "agora mesmo";
    }

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) {
        return `há ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
    }

    const hours = Math.floor(diff / 3600);
    if (hours < 24) {
        return `há ${hours} ${hours === 1 ? "hora" : "horas"}`;
    }

    const days = Math.floor(diff / 86400);
    if (days < 30) {
        return `há ${days} ${days === 1 ? "dia" : "dias"}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `há ${months} ${months === 1 ? "mês" : "meses"}`;
    }

    const years = Math.floor(months / 12);
    return `há ${years} ${years === 1 ? "ano" : "anos"}`;
}

export default function useTimeAgo(date: any) {
    const [text, setText] = useState(() => timeAgo(new Date(date)));

    useEffect(() => {
        const interval = setInterval(() => {
            setText(timeAgo(new Date(date)));
        }, 60 * 1000); // atualiza a cada 1 min

        return () => clearInterval(interval);
    }, [date]);

    return text;
}