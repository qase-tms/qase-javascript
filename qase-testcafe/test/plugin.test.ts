// import { describe, expect, it } from '@jest/globals';
// import init from '../src';
//
// describe('Tests', () => {
//   it('Init main class', () => {
//     init();
//   });
//
//   describe('Auto Create Defect', () => {
//     describe('known test cases', () => {
//       const { reporter } = init();
//       const testData = [
//         {
//           test: {
//             name: 'test 1',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {
//               CID: [1],
//             },
//           },
//           status: 'failed',
//           defect: true,
//         },
//         {
//           test: {
//             name: 'test 2',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {
//               CID: [2],
//             },
//           },
//           status: 'passed',
//           defect: false,
//         },
//         {
//           test: {
//             name: 'test 3',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {
//               CID: [3],
//             },
//           },
//           status: 'skipped',
//           defect: false,
//         },
//         {
//           test: {
//             name: 'test 4',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {
//               CID: [4],
//             },
//           },
//           status: 'blocked',
//           defect: false,
//         },
//         {
//           test: {
//             name: 'test 5',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {
//               CID: [5],
//             },
//           },
//           status: 'invalid',
//           defect: false,
//         },
//         {
//           test: {
//             name: 'test 6',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {
//               CID: [6],
//             },
//           },
//           status: 'in_progress',
//           defect: false,
//         },
//       ];
//
//       testData.forEach(({ test, status, defect }, index) => {
//         // add test data
//         reporter['prepareCaseResult'](test as any, status as any, []);
//
//         // check test data for expected defect value
//         it(`should set defect=${defect} when status=${status}`, () => {
//           expect(reporter['results'][index].defect).toBe(defect);
//         });
//       });
//     });
//
//     describe('unknown test cases', () => {
//       const { reporter } = init();
//       const testData = [
//         {
//           test: {
//             name: 'test 1',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {},
//           },
//           status: 'failed',
//           defect: true,
//         },
//         {
//           test: {
//             name: 'test 2',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {},
//           },
//           status: 'passed',
//           defect: false,
//         },
//         {
//           test: {
//             name: 'test 3',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {},
//           },
//           status: 'skipped',
//           defect: false,
//         },
//         {
//           test: {
//             name: 'test 4',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {},
//           },
//           status: 'blocked',
//           defect: false,
//         },
//         {
//           test: {
//             name: 'test 5',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {},
//           },
//           status: 'invalid',
//           defect: false,
//         },
//         {
//           test: {
//             name: 'test 1',
//             info: {
//               durationMs: 1,
//             },
//             attachments: [],
//             meta: {},
//           },
//           status: 'in_progress',
//           defect: false,
//         },
//       ];
//
//       testData.forEach(({ test, status, defect }, index) => {
//         // add test data
//         reporter['prepareCaseResult'](test as any, status as any, []);
//
//         // check test data for expected defect value
//         it(`should set defect=${defect} when status=${status}`, () => {
//           expect(reporter['results'][index].defect).toBe(defect);
//         });
//       });
//     });
//   });
// });
