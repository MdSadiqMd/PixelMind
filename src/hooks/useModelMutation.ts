import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import { Model } from "@/types/ai.types";
import { toast } from './use-toast';

const useModelMutation = () => {
    return useMutation({
        mutationFn: async () => {
            const res = await axios.get("/api/models");
            // console.log("Models fetched:", res.data);
            return res.data as Model[];
        },
        onSuccess: (data) => {
            toast({
                title: "Models Fetched Successfully",
                description: `Fetched ${data.length} models.`,
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to fetch models. Please try again.",
            });
        },
    });
};

export default useModelMutation;