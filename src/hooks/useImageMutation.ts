import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import { toast } from "./use-toast";

const useImageMutation = (selectedModel: string, inputValues: Record<string, any>) => {
    return useMutation({
        mutationFn: async () => {
            const res = await axios.post("/api/image", { model: selectedModel, ...inputValues });
            // console.log("Image generated:", res.data);
            return res.data as string;
        },
        onSuccess: (data) => {
            toast({
                title: "Image Generated Successfully",
                variant: "default",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "An unexpected error occurred while generating the image. Please try again.",
                variant: "destructive",
            });
        },
    });
};

export default useImageMutation;