const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "test1@hotmail.com",
    teamId: "1",
    tableOrBreakoutRoom: "01",
    requestTime: "2024-11-02T22:22:22",
    explanation: "Github issue",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "test1@hotmail.com",
      teamId: "1",
      tableOrBreakoutRoom: "01",
      requestTime: "2024-11-02T22:22:22",
      explanation: "Github issue",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "test2@hotmail.com",
      teamId: "2",
      tableOrBreakoutRoom: "02",
      requestTime: "2024-11-02T33:33:33",
      explanation: "Dokku issue",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "test3@hotmail.com",
      teamId: "3",
      tableOrBreakoutRoom: "03",
      requestTime: "2024-11-02T44:44:44",
      explanation: "VSCode issue",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
