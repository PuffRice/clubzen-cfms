import { add, divide } from "./math";



describe("Testing if Math Functions", () => {

  it("adds two numbers correctly", () => {
    let result = add(2, 3);
    expect(result).toBe(5);
  });

});