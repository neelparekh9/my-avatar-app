export const animationKeyResponseMap = {
  hi: {
    response: "Hello!",
    animation: "Wave"
  },
  yes: {
    response: "Yes, I agree!",
    animation: "NodYes"
  },
  no: {
    response: "No, I disagree!",
    animation: "ShakeNo"
  },
  idle: {
    response: "",
    animation: "Idle"
  }
}

export const conversationMap = {
  initial: [
    { text: "I’m stressed about…", next: "stressResponse" },
    { text: "I’m worried about…", next: "worryResponse" },
    { text: "I don’t feel supported to…", next: "supportResponse" },
    { text: "I don’t want to feel desperate about…", next: "desperationResponse" }
  ],

  // Step for stressResponse with "Zero Negativity" option
  stressResponse: {
    agentResponse: "The starting point whenever you feel stressed is to think about your own attitude. What's that?",
    nextOptions: ["Zero Negativity", "Tell me more about stress"],
    next: "zeroNegativity",
    animation: "NodYes"
  },

  // The zeroNegativity step that gets triggered after selecting "Zero Negativity"
  zeroNegativity: {
    agentResponse: "Zero Negativity is a simple promise to approach others with openness. Would you like to try it?",
    nextOptions: ["Yes, I will", "No, tell me more about it"],
    next: "stressMoreInfo",
    animation: "NodYes"
  },

  // Additional steps for further branching
  stressMoreInfo: {
    agentResponse: "Stress can affect many aspects of life. Let's talk about how to manage it. Which area would you like to explore?",
    nextOptions: ["Work stress", "Relationship stress", "General anxiety"],
    next: "workStress",
    animation: "NodYes"
  },

  // More branching from stressMoreInfo
  workStress: {
    agentResponse: "Work stress can be managed by setting boundaries. Would you like tips on managing workload?",
    nextOptions: ["Yes, give me tips", "No, what else can help?"],
    next: "relationshipStress",
    animation: "NodYes"
  }
};
