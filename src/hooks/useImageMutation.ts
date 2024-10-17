import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const useImageMutation = (selectedModel: string, inputValues: Record<string, any>) => {
    return useMutation({
        mutationFn: async () => {
            const res = await axios.post("/api/image", { model: selectedModel, ...inputValues });
            console.log("Image generated:", res.data);
            return res.data as string;
        },
        onError: () => {
            console.error("Error generating image.");
        },
    });
};

export default useImageMutation;