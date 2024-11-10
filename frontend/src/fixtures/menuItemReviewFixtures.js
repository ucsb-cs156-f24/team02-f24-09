const menuItemReviewFixtures = {
  oneReview: {
    id: 1,
    itemId: 10,
    reviewerEmail: "neil_1@ucsb.edu",
    stars: 1,
    dateReviewed: "2000-01-02T12:00:00",
    comments: "This is a bad item!",
  },
  threeReviews: [
    {
      id: 1,
      itemId: 10,
      reviewerEmail: "neil_1@ucsb.edu",
      stars: 1,
      dateReviewed: "2000-01-02T12:00:00",
      comments: "This is a bad item!",
    },
    {
      id: 2,
      itemId: 20,
      reviewerEmail: "neil_2@ucsb.edu",
      stars: 3,
      dateReviewed: "2001-01-02T12:00:00",
      comments: "This is a mid item!",
    },
    {
      id: 3,
      itemId: 30,
      reviewerEmail: "neil_3@ucsb.edu",
      stars: 5,
      dateReviewed: "2002-01-02T12:00:00",
      comments: "This is a good item!",
    },
  ],
};

export { menuItemReviewFixtures };
