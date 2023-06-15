"use client";

import { useEffect, useRef, useState } from "react";

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default function AIChatBot() {
  const [status, setStatus] = useState("idle");
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content:
        "I'm a chatbot powered by the ChatGPT API. Ask me anything!",
    },
  ]);
  const [inputText, setInputText] = useState("");

  let messagesWindow = useRef(null);

  useEffect(() => {
    if (messagesWindow.current) {
      messagesWindow.current.scrollTop = messagesWindow.current.scrollHeight;
    }
  }, [history]);

  async function handleSend() {
    if (!inputText) {
      return;
    }
    try {
      setStatus("streaming");
      var newHistory = [...history, { role: "user", content: inputText }];
      setInputText("");
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-0613',
        messages: newHistory,
        functions: [
          {
            name: 'get_current_weather',
            description: 'Get the current weather in a given location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state, e.g. San Francisco, CA',
                },
                unit: { type: 'string', enum: ['celsius'] },
              },
              required: ['location', 'unit'],
            },
          },
        ],
        function_call: 'auto',
      });

      const message = response.data.choices[0].message;

      if (message.function_call) {
        const obj = JSON.parse(message.function_call.arguments)
        const functionResponse = await getCurrentWeather(
          obj.location,
          obj.unit,
        );

        newHistory = [...newHistory, {
          role: 'function',
          name: message.function_call.name,
          content: functionResponse,
        }];

        const secondResponse = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo-0613',
          messages: newHistory,
        });

        const result = secondResponse.data.choices[0].message;
        setHistory([...newHistory, result]);
        setStatus("idle");
      } else {
        setHistory([...newHistory, message]);
        setStatus("idle");
      }

    } catch (error) {
      console.error(error);
      window.alert("Something went wrong! " + error.message);
    }
  }

  async function handleRecordClick() {
    try {
      if (status === "idle") {
        await llm.record();
        setStatus("recording");
      } else if (status === "recording") {
        setStatus("transcribing");
        const { audioUrl } = await llm.stopRecording();
        const { text } = await llm.transcribe({ audioUrl });

        setStatus("streaming");
        var newHistory = [...history, { role: "user", content: text }];
        setInputText("");
        const response = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo-0613',
          messages: newHistory,
          functions: [
            {
              name: 'get_current_weather',
              description: 'Get the current weather in a given location.',
              parameters: {
                type: 'object',
                properties: {
                  location: {
                    type: 'string',
                    description: 'The city and state, e.g. San Francisco, CA',
                  },
                  unit: { type: 'string', enum: ['celsius'] },
                },
                required: ['location', 'unit'],
              },
            },
          ],
          function_call: 'auto',
        });

        const message = response.data.choices[0].message;

        if (message.function_call) {
          const obj = JSON.parse(message.function_call.arguments)
          const functionResponse = await getCurrentWeather(
            obj.location,
            obj.unit,
          );

          functionResponse.instructions = "Do not show sunrise and sunset time.";

          console.log(functionResponse);

          newHistory = [...newHistory, {
            role: 'function',
            name: message.function_call.name,
            content: functionResponse,
          }];

          const secondResponse = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo-0613',
            messages: newHistory,
          });

          const result = secondResponse.data.choices[0].message;
          setHistory([...newHistory, result]);
          setStatus("idle");
        }else {
          setHistory([...newHistory, message]);
          setStatus("idle");
        }
      }
    } catch (error) {
      console.error(error);
      window.alert("Something went wrong! " + error.message);
    }
  }

  const Icon = status === "recording" ? Square : Mic;

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-y-hidden">
      <div
        className="w-full flex-1 overflow-y-auto px-4"
        ref={(el) => (messagesWindow.current = el)}
      >
        {history.map((message, idx) => (
          <Message {...message} key={idx} />
        ))}
      </div>
      <div className="w-full pb-4 flex px-4">
        <input
          className="p-2 border rounded w-full block dark:bg-gray-900 dark:text-white"
          type="text"
          placeholder={getInputPlaceholder(status)}
          value={inputText}
          disabled={status !== "idle"}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="p-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-white dark:text-black font-medium ml-2"
          onClick={handleSend}
        >
          Send
        </button>
        <button
          className="p-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-white dark:text-black font-medium ml-2"
          onClick={handleRecordClick}
        >
          <Icon />
        </button>
      </div>
    </div>
  );
}

const Mic = () => (
  // you can also use an icon library like `react-icons` here
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" x2="12" y1="19" y2="22"></line>
  </svg>
);

const Square = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
  </svg>
);

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.substring(1);
}

function getInputPlaceholder(status) {
  switch (status) {
    case "idle":
      return "Ask me anything...";
    case "recording":
      return "Recording audio...";
    case "transcribing":
      return "Transcribing audio...";
    case "streaming":
      return "Wait for my response...";
  }
}

function Message({ role, content }) {
  if (role !== "function") {
    return (
      <div className="my-4">
        <div className="font-semibold text-gray-800 dark:text-white">
          {capitalize(role)}
        </div>
        <div className="text-gray-600 dark:text-gray-200 whitespace-pre-wrap mt-1">
          {content}
        </div>
      </div>
    );
  }
}

async function getCurrentWeather(location, unit) {
  const city = location;
  const api_url = `https://api.api-ninjas.com/v1/weather?city=${city}`;
  const response = await fetch(api_url, {
    headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_NINJAS_API_KEY},
  });
  if (response.ok) {
    const data = await response.json();
    data.unit = unit;
    // console.log(JSON.stringify(data));
    return JSON.stringify(data);
  } else {
    console.log("I am Error")
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
}

