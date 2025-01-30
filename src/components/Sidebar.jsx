import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({
                     models,
                     selectedModel,
                     selectedLabel,
                     availableModels,
                     flashingModel,
                     downloadingModel,
                     onModelChange,
                     onLabelChange,
                     onDownload,
                     onDelete,
                     isModelAvailable
                 }) => {
    const handleDownload = () => {
        const modelName = `${selectedModel.model_identifier}:${selectedLabel}`;
        if (window.confirm(`Download ${modelName}?`)) {
            onDownload(modelName);
        }
    };

    const handleDelete = () => {
        const modelName = `${selectedModel.model_identifier}:${selectedLabel}`;
        if (window.confirm(`Delete ${modelName}?`)) {
            onDelete(modelName);
        }
    };

    return (
        <div className="w-64 bg-gray-800 p-4 border-r border-gray-700 flex flex-col">
            <select
                className="bg-gray-700 text-white p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500"
                onChange={(e) => onModelChange(e.target.value)}
                value={selectedModel.model_identifier}
            >
                {models.map((model) => (
                    <option key={model.model_identifier} value={model.model_identifier}>
                        {model.model_identifier}
                    </option>
                ))}
            </select>

            <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-500">
                    {selectedModel.model_identifier}
                </h3>
                <p className="text-sm text-gray-300 mt-2">
                    {selectedModel.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                    {selectedModel.labels?.map((label) => {
                        const modelLabel = `${selectedModel.model_identifier}:${label.label}`;
                        const available = isModelAvailable(selectedModel.model_identifier, label.label);

                        return (
                            <div key={label.label} className="flex items-center gap-2">
                                <button
                                    className={`px-3 py-1 rounded-lg text-sm ${
                                        selectedLabel === label.label && available
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-600 text-gray-200"
                                    } ${available ? "hover:bg-gray-500" : "cursor-not-allowed opacity-50"}`}
                                    onClick={() => available && onLabelChange(label.label)}
                                    disabled={!available || selectedLabel === label.label}
                                >
                                    {label.label} ({label.size})
                                </button>

                                {available ? (
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm rounded"
                                        title="Delete Model"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleDownload}
                                        className="bg-green-600 hover:bg-green-700 px-2 py-1 text-sm rounded"
                                        title="Download Model"
                                        disabled={downloadingModel}
                                    >
                                        <FontAwesomeIcon icon={downloadingModel ? faSpinner : faDownload} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={`mt-auto text-center text-sm py-2 bg-gray-700 rounded ${
                flashingModel ? (
                    isModelAvailable(selectedModel.model_identifier, selectedLabel)
                        ? "animate-flash bg-gray-800"
                        : "animate-flash-unavailable bg-gray-800"
                ) : "text-white"
            }`}>
                Selected Model {!isModelAvailable(selectedModel.model_identifier, selectedLabel) && "(UNAVAILABLE)"}:<br />
                <code>{`${selectedModel.model_identifier}:${selectedLabel}`}</code>
            </div>
        </div>
    );
};

export default Sidebar;