"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Download } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Model, Schema } from "@/types/ai.types";

export default function SimpleImageGenerator() {
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [schema, setSchema] = useState<Schema | null>(null);
    const [inputValues, setInputValues] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loadingModels, setLoadingModels] = useState(true);
    const [loadingSchema, setLoadingSchema] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoadingModels(true);
        fetch("/api/models")
            .then((res) => res.json())
            .then((data) => {
                setModels(data as Model[]);
                setLoadingModels(false);
            })
            .catch((error) => {
                setError("Failed to fetch models.");
                setLoadingModels(false);
            });
    }, []);

    useEffect(() => {
        if (selectedModel) {
            setLoadingSchema(true);
            fetch(`/api/schema?model=${selectedModel}`)
                .then((res) => res.json())
                .then((ns) => {
                    if (!ns) {
                        setError("Schema not found.");
                        return;
                    }
                    const newSchema = ns as Schema;
                    setSchema(newSchema);

                    const defaultValues = Object.entries(newSchema.input.properties).reduce((acc, [key, prop]) => {
                        if (prop.default !== undefined) acc[key] = prop.default;
                        return acc;
                    }, {} as Record<string, any>);
                    setInputValues(defaultValues);
                    setLoadingSchema(false);
                })
                .catch(() => {
                    setError("Error fetching schema.");
                    setLoadingSchema(false);
                });
        }
    }, [selectedModel]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!isFormValid()) {
                setError("Please fill in all required fields.");
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ model: selectedModel, ...inputValues }),
                });
                const imageUrl = await response.text();
                setGeneratedImage(imageUrl);
            } catch (error) {
                setError("Error generating image.");
            } finally {
                setIsLoading(false);
            }
        },
        [selectedModel, inputValues]
    );

    const isFormValid = useCallback(() => {
        return (
            selectedModel &&
            schema?.input.required.every((field) => inputValues[field] !== undefined && inputValues[field] !== "")
        );
    }, [selectedModel, schema, inputValues]);

    const handleDownload = useCallback(() => {
        if (generatedImage) {
            const link = document.createElement("a");
            link.href = generatedImage;
            link.download = "generated-image.png";
            link.click();
        }
    }, [generatedImage]);

    return (
        <div className="min-h-screen block md:flex">
            <div className="w-full md:w-1/2 block md:flex flex-col md:h-screen">
                <div className="p-4 bg-white space-y-2">
                    <h1 className="text-2xl font-bold">Pixel Mind Image Generator</h1>
                    {error && <div className="text-red-500">{error}</div>}
                </div>
                <div className="flex-grow overflow-auto p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {loadingModels ? (
                            <div>Loading models...</div>
                        ) : (
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-700">AI Model</label>
                                <Select onValueChange={setSelectedModel} value={selectedModel}>
                                    <SelectTrigger id="model">
                                        <SelectValue placeholder="Select an AI model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {models.map(({ id, name }) => (
                                            <SelectItem key={id} value={id}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {loadingSchema ? (
                            <div>Loading schema...</div>
                        ) : (
                            schema &&
                            Object.entries(schema.input.properties).map(([key, value]) => (
                                <div key={key}>
                                    <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                                        {key.charAt(0).toUpperCase() + key.slice(1)} {schema.input.required.includes(key) && "*"}
                                    </label>
                                    <Input
                                        id={key}
                                        type={value.type === "integer" || value.type === "number" ? "number" : "text"}
                                        placeholder={value.description}
                                        value={inputValues[key] || ""}
                                        onChange={(e) => setInputValues((prev) => ({ ...prev, [key]: e.target.value }))}
                                        min={value.minimum}
                                        max={value.maximum}
                                        required={schema.input.required.includes(key)}
                                    />
                                </div>
                            ))
                        )}
                    </form>
                </div>
                <div className="p-4 bg-white">
                    <Button onClick={handleSubmit} disabled={isLoading || !isFormValid()} className="w-full">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Generate Image"}
                    </Button>
                </div>
            </div>
            <div className="w-full md:w-1/2 block md:flex flex-col items-center justify-center p-4 bg-gray-50">
                {isLoading ? (
                    <Loader2 className="h-16 w-16 animate-spin" />
                ) : generatedImage ? (
                    <>
                        <img src={generatedImage} alt="Generated" className="w-full h-auto rounded-lg shadow-lg mb-4" />
                        <Button onClick={handleDownload} className="mt-4">
                            <Download className="mr-2 h-4 w-4" /> Download Image
                        </Button>
                    </>
                ) : (
                    <div className="text-center text-gray-500">Your generated image will appear here</div>
                )}
            </div>
        </div>
    );
}
