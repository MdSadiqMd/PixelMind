import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import { Schema } from "@/types/ai.types";

const useSchemaMutation = (selectedModel: string) => {
    return useMutation({
        mutationFn: async () => {
            if (!selectedModel) return null;
            const res = await axios.get(`/api/schema?model=${selectedModel}`);
            console.log("Schema fetched:", res.data);
            return res.data as Schema;
        },
        onError: () => {
            console.error("Error fetching schema.");
        },
    });
};

export default useSchemaMutation;