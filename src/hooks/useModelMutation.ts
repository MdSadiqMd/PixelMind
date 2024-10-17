import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import { Model } from "@/types/ai.types";

const useModelMutation = () => {
    return useMutation({
        mutationFn: async () => {
            const res = await axios.get("/api/models");
            console.log("Models fetched:", res.data);
            return res.data as Model[];
        },
        onError: () => {
            console.error("Failed to fetch models.");
        },
    });
};

export default useModelMutation;