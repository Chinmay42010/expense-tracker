const Group = require("../models/Group");
const GroupExpense = require("../models/GroupExpense");

// The host's share of every group expense they paid for, as virtual personal
// expenses. Computed on read so deleting a group/expense needs no cleanup.
async function getGroupShares(userId) {
  if (!userId) return [];

  const groups = await Group.find({
    createdBy: userId,
    hostName: { $ne: "" },
  });
  if (groups.length === 0) return [];

  const hostByGroup = new Map(groups.map((g) => [g._id.toString(), g]));
  const ges = await GroupExpense.find({
    groupId: { $in: groups.map((g) => g._id) },
  });

  return ges
    .filter((ge) => {
      const group = hostByGroup.get(ge.groupId.toString());
      return group && ge.paidBy === group.hostName;
    })
    .map((ge) => ({
      _id: `grp-${ge._id}`,
      userId,
      amount: ge.amount / Math.max(ge.splitBetween.length, 1),
      category: ge.category || "Other",
      note: ge.note || "",
      date: ge.createdAt,
      isGroupExpense: true,
      groupName: hostByGroup.get(ge.groupId.toString()).name,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

module.exports = { getGroupShares };
