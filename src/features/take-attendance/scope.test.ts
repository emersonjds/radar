import { describe, expect, it } from "vitest";
import type { Group } from "@/entities/group/model";
import { groupsForRegente } from "./scope";

const groups: Group[] = [
  { id: "g1", name: "A", gradeLevel: "1", shift: "manhã", teacherId: "t1" },
  { id: "g2", name: "B", gradeLevel: "2", shift: "manhã", teacherId: "t2" },
  { id: "g3", name: "C", gradeLevel: "3", shift: "manhã", teacherId: "t1" },
];

describe("groupsForRegente", () => {
  it("returns only the groups where the teacher is regente", () => {
    expect(groupsForRegente(groups, "t1").map((g) => g.id)).toEqual(["g1", "g3"]);
  });

  it("returns an empty list for a null teacher", () => {
    expect(groupsForRegente(groups, null)).toEqual([]);
  });
});
