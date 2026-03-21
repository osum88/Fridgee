export const ACTION_GROUPS = [
  {
    labelKey: "foodActions",
    actions: [
      "ADD",
      "REMOVE",
      "CONSUME",
      "CONSUME_PARTIAL",
      "UPDATE",
      "MERGE",
      "UPDATE_MERGE",
      "LABEL_UPDATE",
      "MIN_QUANTITY_UPDATE",
    ],
  },
  {
    labelKey: "categoryActions",
    actions: ["CATEGORY_RENAME", "CATEGORY_CREATE", "CATEGORY_REMOVE"],
  },
  {
    labelKey: "userActions",
    actions: ["USER_JOINED", "MEMBER_LEFT", "ROLE_CHANGE", "MEMBER_REMOVED"],
  },
];
