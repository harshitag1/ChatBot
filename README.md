# ChatBot

This is an OpenAI powered ChatBot that utilizes the recently added function parameter. The chatbot is capable of providing current weather information and performing other tasks typical of ChatGPT.

## Deployment
The project has been deployed and can be accessed [here](https://chat-bot-alpha-vert.vercel.app/).

## Project Description

The project code provided is written in React and uses the `usellm` library to interact with the ChatGPT API. It enables users to have interactive conversations with the chatbot.

### Features
- The chatbot is powered by the ChatGPT API and developed using the `useLLM` library.
- Users can ask the chatbot any questions or engage in a conversation.
- The chatbot can provide the current weather in a given location by utilizing the `get_current_weather` function.
- The project includes functionality to record and transcribe audio input for text-based conversations.
- The chatbot UI updates in real-time as the conversation progresses.
- The project utilizes the OpenAI API to create chat completions and handle function calls.

### Code Overview
- The project imports necessary libraries such as `react`, `usellm`, and `openai`.
- An API key for the OpenAI service is required and passed to the `OpenAIApi` object.
- The main component `AIChatBot` is defined, which manages the chatbot's state and handles user interactions.
- The `handleSend` function is responsible for sending user input to the chatbot and receiving responses.
- The `handleRecordClick` function handles the recording and transcribing of audio input for the chatbot.
- The UI is divided into a message window and an input section.
- The `Message` component is responsible for rendering individual chat messages, including function responses.
- The `getCurrentWeather` function is used to retrieve the current weather information from an external API.

Please refer to the provided code for a more detailed understanding of the implementation.

For more information about the function parameter, refer to the [OpenAI API reference](https://platform.openai.com/docs/api-reference/chat/create#chat/create-function_call).
