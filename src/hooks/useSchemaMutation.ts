import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import { Schema } from "@/types/ai.types";
import { toast } from "./use-toast";

const useSchemaMutation = (selectedModel: string) => {
    return useMutation({
        mutationFn: async () => {
            if (!selectedModel) return null;
            const res = await axios.get(`/api/schema?model=${selectedModel}`);
            // console.log("Schema fetched:", res.data);
            return res.data as Schema;
        },
        onSuccess: (data) => {
            toast({
                title: "Schema Fetched Successfully",
                description: `Schema for model ${selectedModel} retrieved.`,
                variant: "default",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to fetch schema. Please try again.",
                variant: "destructive",
            });
        },
    });
};

export default useSchemaMutation;