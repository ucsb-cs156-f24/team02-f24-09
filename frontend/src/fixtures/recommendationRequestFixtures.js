const recommendationRequestFixtures = {
    oneRequest: {
      id: 1,
      requesterEmail: "request1@gmail.com",
      professorEmail: "professor@ucsb.edu",
      explanation: "This is a single request",
      dateRequested: "2024-11-04T00:00:00",
      dateNeeded: "2024-11-05T00:00:00",
      done: true,
    },
    threeRequests: [
      {
        id: 1,
        requesterEmail: "temp1@ucsb.edu",
        professorEmail: "professorTemp@ucsb.edu",
        explanation: "explanation 1",
        dateRequested: "2024-11-04T00:00:00",
        dateNeeded: "2024-11-05T00:00:00",
        done: false,
      },
      {
        id: 2,
        requesterEmail: "request2@gmail.com",
        professorEmail: "professor2@ucsb.edu",
        explanation: "another example explanation",
        dateRequested: "2024-11-04T00:00:00",
        dateNeeded: "2024-11-05T00:00:00",
        done: true,
      },
      {
        id: 3,
        requesterEmail: "request3@gmail.com",
        professorEmail: "professor3@ucsb.edu",
        explanation: "last explanation",
        dateRequested: "2024-11-04T00:00:00",
        dateNeeded: "2024-11-05T00:00:00",
        done: false,
      },
    ],
  };
  
  export { recommendationRequestFixtures };