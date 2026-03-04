// export type TrueSkillConfig = {
//   performanceNoise: number;
//   driftRate: number;
//   drawRate: number;
//   conservatism: number;
// };

export type TrueSkillConfig = {
  mu0: number,
  sigma0:number,
  beta:number,
  tau: number,
  drawRate:number
}
