"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Image as ImageIcon, Sparkles } from "lucide-react";
import axios from "axios";

import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Schema, Model } from "@/types/ai.types";

const PixelMind = () => {
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [schema, setSchema] = useState<Schema | null>(null);
    const [inputValues, setInputValues] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loadingModels, setLoadingModels] = useState(true);
    const [loadingSchema, setLoadingSchema] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Define submitMutation at the top level
    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post("/api/image", { model: selectedModel, ...inputValues });
            return res.data as string;
        },
        onSuccess: (data) => {
            setGeneratedImage(data);
            setIsLoading(false);
        },
        onError: () => {
            setError("Error generating image.");
            setIsLoading(false);
        },
    });

    const fetchModelsMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.get("/api/models");
            return res.data as Model[];
        },
        onSuccess: (data) => {
            setModels(data);
            setLoadingModels(false);
        },
        onError: () => {
            setError("Failed to fetch models.");
        },
    });

    const fetchSchemaMutation = useMutation({
        mutationFn: async () => {
            if (!selectedModel) return null;
            const res = await axios.get(`/api/schema?model=${selectedModel}`);
            return res.data as Schema;
        },
        onSuccess: (data) => {
            setSchema(data);
            if (data) {
                setInputValues(getDefaultInputValues(data.input.properties));
            }
            setLoadingSchema(false);
        },
        onError: () => {
            setError("Error fetching schema.");
        },
    });

    useEffect(() => {
        (async () => {
            fetchModelsMutation.mutate();
        })();
    }, []);

    useEffect(() => {
        if (selectedModel) {
            setLoadingSchema(true);
            fetchSchemaMutation.mutate();
        }
    }, [selectedModel]);

    const getDefaultInputValues = (properties: Record<string, any>) => {
        return Object.entries(properties).reduce((acc, [key, prop]) => {
            if (prop.default !== undefined) acc[key] = prop.default;
            return acc;
        }, {} as Record<string, any>);
    };

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!isFormValid()) {
                setError("Please fill in all required fields.");
                return;
            }

            setIsLoading(true);
            setError(null);

            submitMutation.mutate(); // Call the mutation here
        },
        [submitMutation, selectedModel, inputValues] // Include submitMutation in the dependencies
    );

    const isFormValid = useCallback(() => {
        return selectedModel && schema?.input.required.every((field) => inputValues[field] !== undefined && inputValues[field] !== "");
    }, [selectedModel, schema, inputValues]);

    const handleDownload = useCallback(() => {
        if (generatedImage) {
            const link = document.createElement("a");
            link.href = generatedImage;
            link.download = "pixelmind-creation.png";
            link.click();
        }
    }, [generatedImage]);

    return (
        <div className="min-h-screen bg-[#16161a] text-[#94a1b2]">
            <header className="py-6 px-4 bg-[#16161a] border-b border-[#010101]">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Sparkles className="h-8 w-8 text-[#7f5af0]" />
                        <h1 className="text-2xl font-bold text-[#fffffe]">PixelMind</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 mt-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <Card className="w-full md:w-1/2 bg-[#242629] border-[#010101]">
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="model-select" className="text-[#94a1b2]">
                                        Select Model
                                    </Label>
                                    <Select disabled={loadingModels} value={selectedModel} onValueChange={setSelectedModel}>
                                        <SelectTrigger id="model-select" className="bg-[#16161a] border-[#010101] text-[#fffffe]">
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#16161a] border-[#010101]">
                                            {models.map((model) => (
                                                <SelectItem key={model.id} value={model.id} className="text-[#fffffe]">
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {loadingSchema && <p className="text-sm text-[#94a1b2] animate-pulse">Loading schema...</p>}

                                <ScrollArea className="h-[400px] w-full rounded-md border border-[#010101] p-4">
                                    <AnimatePresence>
                                        {schema &&
                                            Object.entries(schema.input.properties).map(([key, prop]) => (
                                                <motion.div
                                                    key={key}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-2 mb-4"
                                                >
                                                    <Label htmlFor={key} className="text-[#94a1b2]">
                                                        {key}
                                                    </Label>
                                                    <Input
                                                        id={key}
                                                        type={prop.type === "number" ? "number" : "text"}
                                                        value={inputValues[key] || ""}
                                                        onChange={(e) => setInputValues({ ...inputValues, [key]: e.target.value })}
                                                        required={schema.input.required.includes(key)}
                                                        className="bg-[#16161a] border-[#010101] text-[#fffffe] placeholder-[#72757e]"
                                                    />
                                                </motion.div>
                                            ))}
                                    </AnimatePresence>
                                </ScrollArea>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button type="submit" disabled={isLoading || !isFormValid()} className="w-full bg-[#7f5af0] hover:bg-[#7f5af0]/90 text-[#fffffe]">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                Generate Image
                                            </>
                                        )}
                                    </Button>
                                </motion.div>

                                {error && (
                                    <Alert variant="destructive" className="mt-4 bg-red-900/20 border-red-900/50">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="w-full md:w-1/2 bg-[#242629] border-[#010101]">
                        <CardContent className="p-6">
                            {generatedImage && (
                                <div className="flex flex-col items-center">
                                    <img src={generatedImage} alt="Generated" className="max-w-full rounded-lg" />
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
                                        <Button onClick={handleDownload} className="w-full bg-[#7f5af0] hover:bg-[#7f5af0]/90 text-[#fffffe]">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Image
                                        </Button>
                                    </motion.div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default PixelMind;