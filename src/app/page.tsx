"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Image as ImageIcon, BrainCircuit, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Schema, Model } from "@/types/ai.types";
import { useImageMutation, useModelMutation, useSchemaMutation } from "@/hooks";
import getDefaultInputValues from "@/utils/defaultInput.util";

const PixelMind = () => {
    const [state, setState] = useState({
        models: [] as Model[],
        selectedModel: "",
        schema: null as Schema | null,
        inputValues: {} as Record<string, any>,
        isLoading: false,
        generatedImage: null as string | null,
        loadingModels: true,
        loadingSchema: false,
        error: null as string | null,
    });

    const { selectedModel, loadingModels, loadingSchema, inputValues, generatedImage, error } = state;
    const imageMutation = useImageMutation(selectedModel, inputValues);
    const modelMutation = useModelMutation();
    const schemaMutation = useSchemaMutation(selectedModel);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const modelsData = await modelMutation.mutateAsync();
                setState((prev) => ({ ...prev, models: modelsData, loadingModels: false }));
            } catch (err) {
                console.error("Failed to load models:", err);
                setState((prev) => ({ ...prev, error: "Failed to load models." }));
            }
        };
        fetchModels();

        if (selectedModel) {
            const fetchSchema = async () => {
                setState((prev) => ({ ...prev, loadingSchema: true }));
                try {
                    const schemaData = await schemaMutation.mutateAsync();
                    setState((prev) => ({
                        ...prev,
                        schema: schemaData,
                        inputValues: schemaData ? getDefaultInputValues(schemaData.input.properties) : {},
                    }));
                } catch (err) {
                    console.error("Failed to load schema:", err);
                    setState((prev) => ({ ...prev, error: "Failed to load schema." }));
                } finally {
                    setState((prev) => ({ ...prev, loadingSchema: false }));
                }
            };
            fetchSchema();
        }
    }, [selectedModel]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!isFormValid()) {
                setState((prev) => ({ ...prev, error: "Please fill in all required fields." }));
                return;
            }

            setState((prev) => ({ ...prev, isLoading: true, error: null }));
            try {
                const generated = await imageMutation.mutateAsync();
                setState((prev) => ({ ...prev, generatedImage: generated }));
            } catch (err) {
                console.error("Error generating image:", err);
                setState((prev) => ({ ...prev, error: "Failed to generate image." }));
            } finally {
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        },
        [imageMutation, selectedModel, inputValues]
    );

    const isFormValid = () =>
        selectedModel &&
        state.schema?.input?.required?.every((field) => inputValues[field] !== undefined && inputValues[field] !== null);

    const handleDownload = () => {
        if (generatedImage) {
            const link = document.createElement("a");
            link.href = generatedImage;
            link.download = "pixelmind-creation.png";
            link.click();
        }
    };

    const renderSchemaInputs = () =>
        state.schema &&
        Object.entries(state.schema.input?.properties || {}).map(([key, prop]) => {
            const typedProp = prop as { type: string; description?: string; required?: boolean; };
            const placeholder = typedProp.description ? `Enter ${typedProp.description}` : `Enter ${key}`;
            return (
                <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 mb-4"
                >
                    <Label htmlFor={key} className="text-[#94a1b2]">{key}</Label>
                    <Input
                        id={key}
                        type={typedProp.type === "number" ? "number" : "text"}
                        value={inputValues[key] || ""}
                        onChange={(e) => setState((prev) => ({
                            ...prev,
                            inputValues: { ...prev.inputValues, [key]: e.target.value }
                        }))}
                        placeholder={placeholder}
                        required={state.schema?.input?.required?.includes(key) || false}
                        className="bg-[#16161a] border-[#010101] text-[#fffffe] placeholder-[#72757e]"
                    />
                </motion.div>
            );
        });

    return (
        <div className="min-h-screen bg-[#16161a] text-[#94a1b2]">
            <header className="py-6 px-4 bg-[#16161a] border-b">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <BrainCircuit className="h-8 w-8 text-[#7f5af0]" />
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
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="model-select" className="text-[#94a1b2]">Select Model</Label>
                                        <span className="text-[#94a1b2] text-sm flex items-center underline bold decoration-sky-500">
                                            {selectedModel && selectedModel.match(/([^/]+)$$/)?.[0] && (
                                                <Link
                                                    href={`https://developers.cloudflare.com/workers-ai/models/${selectedModel.match(/([^/]+)$$/)?.[0]}/`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center"
                                                >
                                                    For Dummies
                                                    <ExternalLinkIcon className="ml-1 h-4 w-4" />
                                                </Link>
                                            )}
                                        </span>
                                    </div>
                                    <Select
                                        disabled={loadingModels}
                                        value={selectedModel}
                                        onValueChange={(value) => setState((prev) => ({ ...prev, selectedModel: value }))}
                                    >
                                        <SelectTrigger id="model-select" className="bg-[#16161a] border-[#010101] text-[#fffffe]">
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#16161a] border-[#010101]">
                                            {state.models.map((model) => (
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
                                        {renderSchemaInputs()}
                                    </AnimatePresence>
                                </ScrollArea>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        type="submit"
                                        disabled={state.isLoading || !isFormValid()}
                                        className="w-full md:w-1/2 lg:w-1/4 bg-[#7f5af0] hover:bg-[#7f5af0]/90 text-[#fffffe] transition-all duration-300"
                                    >
                                        {state.isLoading ? (
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
                                    <img src={generatedImage} alt="Generated" className="max-w-full h-auto mb-4 rounded-md" />
                                    <motion.button
                                        onClick={handleDownload}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center space-x-2 px-4 py-2 bg-[#7f5af0] hover:bg-[#7f5af0]/90 text-[#fffffe] transition-all duration-300 rounded-md"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download</span>
                                    </motion.button>
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
