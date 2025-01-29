const models = [
    {
        model_identifier: "deepseek-llm",
        description: `An advanced language model crafted with 2 trillion bilingual tokens.`,
        labels: [
            {label: '7b', size: '4.0 GB',},
            {label: '67b', size: '38 GB',},
        ],
        url: "https://ollama.com/library/deepseek-llm",
    },
    {
        model_identifier: "deepseek-coder",
        description: `DeepSeek Coder is a capable coding model trained on two trillion code and natural language 
        tokens.`,
        labels: [
            {label: '1.3b', size: '776 MB',},
            {label: '6.7b', size: '3.8 GB',},
            {label: '33b', size: '19 GB',},
        ],
        url: "https://ollama.com/library/deepseek-coder",
    },
    {
        model_identifier: "deepseek-coder-v2",
        description: `An open-source Mixture-of-Experts code language model that achieves performance comparable to 
        GPT4-Turbo in code-specific tasks.`,
        labels: [
            {label: '16b', size: '8.9 GB',},
            {label: '236b', size: '133 GB',},
        ],
        url: "https://ollama.com/library/deepseek-coder-v2",
    },
    {
        model_identifier: "deepseek-v2",
        description: `A strong, economical, and efficient Mixture-of-Experts language model.`,
        labels: [
            {label: '16b', size: '8.9 GB',},
            {label: '236b', size: '133 GB',},
        ],
        url: "https://ollama.com/library/deepseek-v2",
    },
    {
        model_identifier: "deepseek-v3",
        description: `A strong Mixture-of-Experts (MoE) language model with 671B total parameters with 37B activated 
        for each token.`,
        labels: [
            {label: '617b', size: '404 GB',},
        ],
        url: "https://ollama.com/library/deepseek-v3",
    },
    {
        model_identifier: "deepseek-r1",
        description: `DeepSeek's first-generation of reasoning models with comparable performance to OpenAI-o1, 
        including six dense models distilled from DeepSeek-R1 based on Llama and Qwen.`,
        labels: [
            {label: '1.5b', size: '1.1 GB',},
            {label: '7b', size: '4.7 GB',},
            {label: '8b', size: '4.9 GB',},
            {label: '14b', size: '9 GB',},
            {label: '32b', size: '20 GB',},
            {label: '70b', size: '43 GB',},
            {label: '671b', size: '404. GB',},
        ],
        url: "https://ollama.com/library/deepseek-r1",
    },
]

export default models;