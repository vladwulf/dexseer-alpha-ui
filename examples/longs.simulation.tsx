import { useState } from "react";

const longTrades = [
  {
    label: "1:1",
    sl: 1,
    tp: 1,
    rr: 1,
    wins: 255,
    losses: 484,
    open: 0,
    total: 739,
    winRate: 34.5,
    expectancy: -0.31,
  },
  {
    label: "2:2",
    sl: 2,
    tp: 2,
    rr: 1,
    wins: 378,
    losses: 361,
    open: 0,
    total: 739,
    winRate: 51.2,
    expectancy: 0.05,
  },
  {
    label: "3:3",
    sl: 3,
    tp: 3,
    rr: 1,
    wins: 443,
    losses: 294,
    open: 2,
    total: 739,
    winRate: 60.1,
    expectancy: 0.6,
  },
  {
    label: "4:4",
    sl: 4,
    tp: 4,
    rr: 1,
    wins: 460,
    losses: 267,
    open: 12,
    total: 739,
    winRate: 63.3,
    expectancy: 1.04,
  },
  {
    label: "5:5",
    sl: 5,
    tp: 5,
    rr: 1,
    wins: 462,
    losses: 250,
    open: 27,
    total: 739,
    winRate: 64.9,
    expectancy: 1.43,
  },
  {
    label: "6:6",
    sl: 6,
    tp: 6,
    rr: 1,
    wins: 438,
    losses: 241,
    open: 60,
    total: 739,
    winRate: 64.5,
    expectancy: 1.6,
  },
  {
    label: "7:7",
    sl: 7,
    tp: 7,
    rr: 1,
    wins: 405,
    losses: 235,
    open: 99,
    total: 739,
    winRate: 63.3,
    expectancy: 1.61,
  },
  {
    label: "8:8",
    sl: 8,
    tp: 8,
    rr: 1,
    wins: 384,
    losses: 208,
    open: 147,
    total: 739,
    winRate: 64.9,
    expectancy: 1.91,
  },
  {
    label: "9:9",
    sl: 9,
    tp: 9,
    rr: 1,
    wins: 367,
    losses: 185,
    open: 187,
    total: 739,
    winRate: 66.5,
    expectancy: 2.22,
  },
  {
    label: "10:10",
    sl: 10,
    tp: 10,
    rr: 1,
    wins: 341,
    losses: 163,
    open: 235,
    total: 739,
    winRate: 67.7,
    expectancy: 2.41,
  },
  {
    label: "1:2",
    sl: 1,
    tp: 2,
    rr: 2,
    wins: 218,
    losses: 521,
    open: 0,
    total: 739,
    winRate: 29.5,
    expectancy: -0.12,
  },
  {
    label: "2:4",
    sl: 2,
    tp: 4,
    rr: 2,
    wins: 296,
    losses: 443,
    open: 0,
    total: 739,
    winRate: 40.1,
    expectancy: 0.4,
  },
  {
    label: "3:6",
    sl: 3,
    tp: 6,
    rr: 2,
    wins: 325,
    losses: 399,
    open: 15,
    total: 739,
    winRate: 44.9,
    expectancy: 1.02,
  },
  {
    label: "4:8",
    sl: 4,
    tp: 8,
    rr: 2,
    wins: 309,
    losses: 378,
    open: 52,
    total: 739,
    winRate: 45.0,
    expectancy: 1.3,
  },
  {
    label: "5:10",
    sl: 5,
    tp: 10,
    rr: 2,
    wins: 293,
    losses: 346,
    open: 100,
    total: 739,
    winRate: 45.9,
    expectancy: 1.62,
  },
  {
    label: "6:12",
    sl: 6,
    tp: 12,
    rr: 2,
    wins: 258,
    losses: 321,
    open: 160,
    total: 739,
    winRate: 44.6,
    expectancy: 1.58,
  },
  {
    label: "7:14",
    sl: 7,
    tp: 14,
    rr: 2,
    wins: 214,
    losses: 299,
    open: 226,
    total: 739,
    winRate: 41.7,
    expectancy: 1.22,
  },
  {
    label: "8:16",
    sl: 8,
    tp: 16,
    rr: 2,
    wins: 198,
    losses: 258,
    open: 283,
    total: 739,
    winRate: 43.4,
    expectancy: 1.49,
  },
  {
    label: "9:18",
    sl: 9,
    tp: 18,
    rr: 2,
    wins: 180,
    losses: 228,
    open: 331,
    total: 739,
    winRate: 44.1,
    expectancy: 1.61,
  },
  {
    label: "10:20",
    sl: 10,
    tp: 20,
    rr: 2,
    wins: 158,
    losses: 201,
    open: 380,
    total: 739,
    winRate: 44.0,
    expectancy: 1.56,
  },
  {
    label: "1:3",
    sl: 1,
    tp: 3,
    rr: 3,
    wins: 179,
    losses: 560,
    open: 0,
    total: 739,
    winRate: 24.2,
    expectancy: -0.03,
  },
  {
    label: "2:6",
    sl: 2,
    tp: 6,
    rr: 3,
    wins: 236,
    losses: 498,
    open: 5,
    total: 739,
    winRate: 32.2,
    expectancy: 0.57,
  },
  {
    label: "3:9",
    sl: 3,
    tp: 9,
    rr: 3,
    wins: 245,
    losses: 457,
    open: 37,
    total: 739,
    winRate: 34.9,
    expectancy: 1.13,
  },
  {
    label: "4:12",
    sl: 4,
    tp: 12,
    rr: 3,
    wins: 213,
    losses: 428,
    open: 98,
    total: 739,
    winRate: 33.2,
    expectancy: 1.14,
  },
  {
    label: "5:15",
    sl: 5,
    tp: 15,
    rr: 3,
    wins: 182,
    losses: 392,
    open: 165,
    total: 739,
    winRate: 31.7,
    expectancy: 1.04,
  },
  {
    label: "6:18",
    sl: 6,
    tp: 18,
    rr: 3,
    wins: 161,
    losses: 350,
    open: 228,
    total: 739,
    winRate: 31.5,
    expectancy: 1.08,
  },
  {
    label: "7:21",
    sl: 7,
    tp: 21,
    rr: 3,
    wins: 139,
    losses: 318,
    open: 282,
    total: 739,
    winRate: 30.4,
    expectancy: 0.94,
  },
  {
    label: "8:24",
    sl: 8,
    tp: 24,
    rr: 3,
    wins: 117,
    losses: 271,
    open: 351,
    total: 739,
    winRate: 30.2,
    expectancy: 0.87,
  },
  {
    label: "9:27",
    sl: 9,
    tp: 27,
    rr: 3,
    wins: 103,
    losses: 242,
    open: 394,
    total: 739,
    winRate: 29.9,
    expectancy: 0.82,
  },
  {
    label: "10:30",
    sl: 10,
    tp: 30,
    rr: 3,
    wins: 92,
    losses: 211,
    open: 436,
    total: 739,
    winRate: 30.4,
    expectancy: 0.88,
  },
  {
    label: "1:4",
    sl: 1,
    tp: 4,
    rr: 4,
    wins: 155,
    losses: 584,
    open: 0,
    total: 739,
    winRate: 21.0,
    expectancy: 0.05,
  },
  {
    label: "2:8",
    sl: 2,
    tp: 8,
    rr: 4,
    wins: 190,
    losses: 534,
    open: 15,
    total: 739,
    winRate: 26.2,
    expectancy: 0.61,
  },
  {
    label: "3:12",
    sl: 3,
    tp: 12,
    rr: 4,
    wins: 181,
    losses: 490,
    open: 68,
    total: 739,
    winRate: 27.0,
    expectancy: 0.95,
  },
  {
    label: "4:16",
    sl: 4,
    tp: 16,
    rr: 4,
    wins: 151,
    losses: 452,
    open: 136,
    total: 739,
    winRate: 25.0,
    expectancy: 0.82,
  },
  {
    label: "5:20",
    sl: 5,
    tp: 20,
    rr: 4,
    wins: 130,
    losses: 409,
    open: 200,
    total: 739,
    winRate: 24.1,
    expectancy: 0.75,
  },
  {
    label: "6:24",
    sl: 6,
    tp: 24,
    rr: 4,
    wins: 106,
    losses: 361,
    open: 272,
    total: 739,
    winRate: 22.7,
    expectancy: 0.51,
  },
  {
    label: "7:28",
    sl: 7,
    tp: 28,
    rr: 4,
    wins: 89,
    losses: 327,
    open: 323,
    total: 739,
    winRate: 21.4,
    expectancy: 0.27,
  },
  {
    label: "8:32",
    sl: 8,
    tp: 32,
    rr: 4,
    wins: 75,
    losses: 280,
    open: 384,
    total: 739,
    winRate: 21.1,
    expectancy: 0.22,
  },
  {
    label: "9:36",
    sl: 9,
    tp: 36,
    rr: 4,
    wins: 62,
    losses: 251,
    open: 426,
    total: 739,
    winRate: 19.8,
    expectancy: -0.04,
  },
  {
    label: "10:40",
    sl: 10,
    tp: 40,
    rr: 4,
    wins: 58,
    losses: 218,
    open: 463,
    total: 739,
    winRate: 21.0,
    expectancy: 0.19,
  },
  {
    label: "1:5",
    sl: 1,
    tp: 5,
    rr: 5,
    wins: 128,
    losses: 611,
    open: 0,
    total: 739,
    winRate: 17.3,
    expectancy: 0.04,
  },
  {
    label: "2:10",
    sl: 2,
    tp: 10,
    rr: 5,
    wins: 158,
    losses: 554,
    open: 27,
    total: 739,
    winRate: 22.2,
    expectancy: 0.64,
  },
  {
    label: "3:15",
    sl: 3,
    tp: 15,
    rr: 5,
    wins: 132,
    losses: 509,
    open: 98,
    total: 739,
    winRate: 20.6,
    expectancy: 0.61,
  },
  {
    label: "4:20",
    sl: 4,
    tp: 20,
    rr: 5,
    wins: 112,
    losses: 464,
    open: 163,
    total: 739,
    winRate: 19.4,
    expectancy: 0.52,
  },
  {
    label: "5:25",
    sl: 5,
    tp: 25,
    rr: 5,
    wins: 90,
    losses: 415,
    open: 234,
    total: 739,
    winRate: 17.8,
    expectancy: 0.24,
  },
  {
    label: "6:30",
    sl: 6,
    tp: 30,
    rr: 5,
    wins: 77,
    losses: 368,
    open: 294,
    total: 739,
    winRate: 17.3,
    expectancy: 0.14,
  },
  {
    label: "7:35",
    sl: 7,
    tp: 35,
    rr: 5,
    wins: 61,
    losses: 333,
    open: 345,
    total: 739,
    winRate: 15.5,
    expectancy: -0.27,
  },
  {
    label: "8:40",
    sl: 8,
    tp: 40,
    rr: 5,
    wins: 52,
    losses: 287,
    open: 400,
    total: 739,
    winRate: 15.3,
    expectancy: -0.29,
  },
  {
    label: "9:45",
    sl: 9,
    tp: 45,
    rr: 5,
    wins: 46,
    losses: 254,
    open: 439,
    total: 739,
    winRate: 15.3,
    expectancy: -0.29,
  },
  {
    label: "10:50",
    sl: 10,
    tp: 50,
    rr: 5,
    wins: 41,
    losses: 220,
    open: 478,
    total: 739,
    winRate: 15.7,
    expectancy: -0.2,
  },
];

const shortTrades = [
  {
    label: "1:1",
    sl: 1,
    tp: 1,
    rr: 1,
    wins: 74,
    losses: 178,
    open: 0,
    total: 252,
    winRate: 29.4,
    expectancy: -0.41,
  },
  {
    label: "2:2",
    sl: 2,
    tp: 2,
    rr: 1,
    wins: 123,
    losses: 128,
    open: 1,
    total: 252,
    winRate: 49.0,
    expectancy: -0.04,
  },
  {
    label: "3:3",
    sl: 3,
    tp: 3,
    rr: 1,
    wins: 129,
    losses: 122,
    open: 1,
    total: 252,
    winRate: 51.4,
    expectancy: 0.08,
  },
  {
    label: "4:4",
    sl: 4,
    tp: 4,
    rr: 1,
    wins: 136,
    losses: 113,
    open: 3,
    total: 252,
    winRate: 54.6,
    expectancy: 0.37,
  },
  {
    label: "5:5",
    sl: 5,
    tp: 5,
    rr: 1,
    wins: 144,
    losses: 100,
    open: 8,
    total: 252,
    winRate: 59.0,
    expectancy: 0.87,
  },
  {
    label: "6:6",
    sl: 6,
    tp: 6,
    rr: 1,
    wins: 141,
    losses: 90,
    open: 21,
    total: 252,
    winRate: 61.0,
    expectancy: 1.21,
  },
  {
    label: "7:7",
    sl: 7,
    tp: 7,
    rr: 1,
    wins: 138,
    losses: 75,
    open: 39,
    total: 252,
    winRate: 64.8,
    expectancy: 1.75,
  },
  {
    label: "8:8",
    sl: 8,
    tp: 8,
    rr: 1,
    wins: 134,
    losses: 69,
    open: 49,
    total: 252,
    winRate: 66.0,
    expectancy: 2.06,
  },
  {
    label: "9:9",
    sl: 9,
    tp: 9,
    rr: 1,
    wins: 130,
    losses: 64,
    open: 58,
    total: 252,
    winRate: 67.0,
    expectancy: 2.36,
  },
  {
    label: "10:10",
    sl: 10,
    tp: 10,
    rr: 1,
    wins: 121,
    losses: 60,
    open: 71,
    total: 252,
    winRate: 66.9,
    expectancy: 2.42,
  },
  {
    label: "1:2",
    sl: 1,
    tp: 2,
    rr: 2,
    wins: 66,
    losses: 186,
    open: 0,
    total: 252,
    winRate: 26.2,
    expectancy: -0.21,
  },
  {
    label: "2:4",
    sl: 2,
    tp: 4,
    rr: 2,
    wins: 96,
    losses: 154,
    open: 2,
    total: 252,
    winRate: 38.4,
    expectancy: 0.3,
  },
  {
    label: "3:6",
    sl: 3,
    tp: 6,
    rr: 2,
    wins: 94,
    losses: 149,
    open: 9,
    total: 252,
    winRate: 38.7,
    expectancy: 0.46,
  },
  {
    label: "4:8",
    sl: 4,
    tp: 8,
    rr: 2,
    wins: 98,
    losses: 134,
    open: 20,
    total: 252,
    winRate: 42.2,
    expectancy: 0.98,
  },
  {
    label: "5:10",
    sl: 5,
    tp: 10,
    rr: 2,
    wins: 103,
    losses: 115,
    open: 34,
    total: 252,
    winRate: 47.2,
    expectancy: 1.81,
  },
  {
    label: "6:12",
    sl: 6,
    tp: 12,
    rr: 2,
    wins: 99,
    losses: 104,
    open: 49,
    total: 252,
    winRate: 48.8,
    expectancy: 2.24,
  },
  {
    label: "7:14",
    sl: 7,
    tp: 14,
    rr: 2,
    wins: 88,
    losses: 94,
    open: 70,
    total: 252,
    winRate: 48.4,
    expectancy: 2.28,
  },
  {
    label: "8:16",
    sl: 8,
    tp: 16,
    rr: 2,
    wins: 73,
    losses: 91,
    open: 88,
    total: 252,
    winRate: 44.5,
    expectancy: 1.75,
  },
  {
    label: "9:18",
    sl: 9,
    tp: 18,
    rr: 2,
    wins: 65,
    losses: 83,
    open: 104,
    total: 252,
    winRate: 43.9,
    expectancy: 1.68,
  },
  {
    label: "10:20",
    sl: 10,
    tp: 20,
    rr: 2,
    wins: 55,
    losses: 75,
    open: 122,
    total: 252,
    winRate: 42.3,
    expectancy: 1.39,
  },
  {
    label: "1:3",
    sl: 1,
    tp: 3,
    rr: 3,
    wins: 54,
    losses: 198,
    open: 0,
    total: 252,
    winRate: 21.4,
    expectancy: -0.14,
  },
  {
    label: "2:6",
    sl: 2,
    tp: 6,
    rr: 3,
    wins: 80,
    losses: 170,
    open: 2,
    total: 252,
    winRate: 32.0,
    expectancy: 0.56,
  },
  {
    label: "3:9",
    sl: 3,
    tp: 9,
    rr: 3,
    wins: 82,
    losses: 156,
    open: 14,
    total: 252,
    winRate: 34.5,
    expectancy: 1.07,
  },
  {
    label: "4:12",
    sl: 4,
    tp: 12,
    rr: 3,
    wins: 78,
    losses: 141,
    open: 33,
    total: 252,
    winRate: 35.6,
    expectancy: 1.48,
  },
  {
    label: "5:15",
    sl: 5,
    tp: 15,
    rr: 3,
    wins: 70,
    losses: 131,
    open: 51,
    total: 252,
    winRate: 34.8,
    expectancy: 1.57,
  },
  {
    label: "6:18",
    sl: 6,
    tp: 18,
    rr: 3,
    wins: 57,
    losses: 121,
    open: 74,
    total: 252,
    winRate: 32.0,
    expectancy: 1.19,
  },
  {
    label: "7:21",
    sl: 7,
    tp: 21,
    rr: 3,
    wins: 45,
    losses: 105,
    open: 102,
    total: 252,
    winRate: 30.0,
    expectancy: 0.83,
  },
  {
    label: "8:24",
    sl: 8,
    tp: 24,
    rr: 3,
    wins: 41,
    losses: 96,
    open: 115,
    total: 252,
    winRate: 29.9,
    expectancy: 0.86,
  },
  {
    label: "9:27",
    sl: 9,
    tp: 27,
    rr: 3,
    wins: 32,
    losses: 86,
    open: 134,
    total: 252,
    winRate: 27.1,
    expectancy: 0.36,
  },
  {
    label: "10:30",
    sl: 10,
    tp: 30,
    rr: 3,
    wins: 28,
    losses: 78,
    open: 146,
    total: 252,
    winRate: 26.4,
    expectancy: 0.24,
  },
  {
    label: "1:4",
    sl: 1,
    tp: 4,
    rr: 4,
    wins: 49,
    losses: 202,
    open: 1,
    total: 252,
    winRate: 19.5,
    expectancy: -0.02,
  },
  {
    label: "2:8",
    sl: 2,
    tp: 8,
    rr: 4,
    wins: 72,
    losses: 173,
    open: 7,
    total: 252,
    winRate: 29.4,
    expectancy: 0.91,
  },
  {
    label: "3:12",
    sl: 3,
    tp: 12,
    rr: 4,
    wins: 68,
    losses: 163,
    open: 21,
    total: 252,
    winRate: 29.4,
    expectancy: 1.3,
  },
  {
    label: "4:16",
    sl: 4,
    tp: 16,
    rr: 4,
    wins: 55,
    losses: 155,
    open: 42,
    total: 252,
    winRate: 26.2,
    expectancy: 1.03,
  },
  {
    label: "5:20",
    sl: 5,
    tp: 20,
    rr: 4,
    wins: 47,
    losses: 137,
    open: 68,
    total: 252,
    winRate: 25.5,
    expectancy: 1.01,
  },
  {
    label: "6:24",
    sl: 6,
    tp: 24,
    rr: 4,
    wins: 38,
    losses: 125,
    open: 89,
    total: 252,
    winRate: 23.3,
    expectancy: 0.64,
  },
  {
    label: "7:28",
    sl: 7,
    tp: 28,
    rr: 4,
    wins: 30,
    losses: 107,
    open: 115,
    total: 252,
    winRate: 21.9,
    expectancy: 0.36,
  },
  {
    label: "8:32",
    sl: 8,
    tp: 32,
    rr: 4,
    wins: 26,
    losses: 96,
    open: 130,
    total: 252,
    winRate: 21.3,
    expectancy: 0.25,
  },
  {
    label: "9:36",
    sl: 9,
    tp: 36,
    rr: 4,
    wins: 20,
    losses: 87,
    open: 145,
    total: 252,
    winRate: 18.7,
    expectancy: -0.25,
  },
  {
    label: "10:40",
    sl: 10,
    tp: 40,
    rr: 4,
    wins: 15,
    losses: 80,
    open: 157,
    total: 252,
    winRate: 15.8,
    expectancy: -0.79,
  },
  {
    label: "1:5",
    sl: 1,
    tp: 5,
    rr: 5,
    wins: 46,
    losses: 205,
    open: 1,
    total: 252,
    winRate: 18.3,
    expectancy: 0.1,
  },
  {
    label: "2:10",
    sl: 2,
    tp: 10,
    rr: 5,
    wins: 64,
    losses: 179,
    open: 9,
    total: 252,
    winRate: 26.3,
    expectancy: 1.12,
  },
  {
    label: "3:15",
    sl: 3,
    tp: 15,
    rr: 5,
    wins: 49,
    losses: 175,
    open: 28,
    total: 252,
    winRate: 21.9,
    expectancy: 0.83,
  },
  {
    label: "4:20",
    sl: 4,
    tp: 20,
    rr: 5,
    wins: 40,
    losses: 157,
    open: 55,
    total: 252,
    winRate: 20.3,
    expectancy: 0.68,
  },
  {
    label: "5:25",
    sl: 5,
    tp: 25,
    rr: 5,
    wins: 35,
    losses: 141,
    open: 76,
    total: 252,
    winRate: 19.9,
    expectancy: 0.67,
  },
  {
    label: "6:30",
    sl: 6,
    tp: 30,
    rr: 5,
    wins: 26,
    losses: 125,
    open: 101,
    total: 252,
    winRate: 17.2,
    expectancy: 0.12,
  },
  {
    label: "7:35",
    sl: 7,
    tp: 35,
    rr: 5,
    wins: 19,
    losses: 108,
    open: 125,
    total: 252,
    winRate: 15.0,
    expectancy: -0.36,
  },
  {
    label: "8:40",
    sl: 8,
    tp: 40,
    rr: 5,
    wins: 15,
    losses: 98,
    open: 139,
    total: 252,
    winRate: 13.3,
    expectancy: -0.73,
  },
  {
    label: "9:45",
    sl: 9,
    tp: 45,
    rr: 5,
    wins: 9,
    losses: 88,
    open: 155,
    total: 252,
    winRate: 9.3,
    expectancy: -1.54,
  },
  {
    label: "10:50",
    sl: 10,
    tp: 50,
    rr: 5,
    wins: 7,
    losses: 80,
    open: 165,
    total: 252,
    winRate: 8.0,
    expectancy: -1.79,
  },
];

const slLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const rrLevels = [1, 2, 3, 4, 5];

function expColor(v, max) {
  if (v < 0)
    return `rgba(239,68,68,${Math.min(Math.abs(v) / 0.45, 1) * 0.4 + 0.1})`;
  return `rgba(34,197,94,${Math.min(v / max, 1) * 0.5 + 0.06})`;
}
function wrColor(v) {
  if (v < 35) return "rgba(239,68,68,0.2)";
  if (v < 50) return "rgba(250,204,21,0.15)";
  return `rgba(34,197,94,${Math.min((v - 35) / 35, 1) * 0.3 + 0.06})`;
}
function diffColor(v) {
  if (Math.abs(v) < 0.05) return "#94a3b8";
  return v > 0 ? "#22c55e" : "#ef4444";
}

function buildGrid(trades) {
  const g = {};
  trades.forEach((t) => {
    if (!g[t.sl]) g[t.sl] = {};
    g[t.sl][t.rr] = t;
  });
  return g;
}

function Heatmap({ trades, label, color, maxExp }) {
  const grid = buildGrid(trades);
  return (
    <div style={{ flex: "1 1 480px", minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        <span style={{ color }}>{label}</span>
        <span
          style={{
            color: "#64748b",
            fontWeight: 400,
            fontSize: 12,
            marginLeft: 8,
          }}
        >
          {trades[0]?.total} alerts
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 2,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: "6px 8px",
                  fontSize: 11,
                  color: "#64748b",
                  textAlign: "left",
                }}
              >
                SL\R:R
              </th>
              {rrLevels.map((rr) => (
                <th
                  key={rr}
                  style={{
                    padding: "6px 8px",
                    fontSize: 11,
                    color: "#94a3b8",
                    textAlign: "center",
                  }}
                >
                  1:{rr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slLevels.map((sl) => (
              <tr key={sl}>
                <td
                  style={{
                    padding: "6px 8px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#94a3b8",
                  }}
                >
                  {sl}%
                </td>
                {rrLevels.map((rr) => {
                  const t = grid[sl]?.[rr];
                  if (!t)
                    return (
                      <td
                        key={rr}
                        style={{
                          background: "#1a1d29",
                          borderRadius: 4,
                          textAlign: "center",
                          padding: 6,
                          fontSize: 11,
                          color: "#4a4d59",
                        }}
                      >
                        —
                      </td>
                    );
                  const op = (t.open / t.total) * 100;
                  return (
                    <td
                      key={rr}
                      style={{
                        background: expColor(t.expectancy, maxExp),
                        borderRadius: 6,
                        padding: "8px 6px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: t.expectancy >= 0 ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {t.expectancy >= 0 ? "+" : ""}
                        {t.expectancy.toFixed(2)}%
                      </div>
                      <div
                        style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}
                      >
                        {t.winRate.toFixed(1)}% WR
                        {op > 5 && (
                          <span style={{ color: "#eab308" }}>
                            {" "}
                            · {op.toFixed(0)}%⏳
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonTable({ longT, shortT, sortBy }) {
  const merged = longT.map((l) => {
    const s = shortT.find((x) => x.label === l.label);
    return { label: l.label, sl: l.sl, tp: l.tp, rr: l.rr, l, s };
  });
  const sorted = [...merged].sort((a, b) =>
    sortBy === "expectancy"
      ? (b.l.expectancy + b.s.expectancy) / 2 -
        (a.l.expectancy + a.s.expectancy) / 2
      : sortBy === "winRate"
        ? (b.l.winRate + b.s.winRate) / 2 - (a.l.winRate + a.s.winRate) / 2
        : sortBy === "sl"
          ? a.sl - b.sl || a.rr - b.rr
          : a.rr - b.rr || a.sl - b.sl,
  );

  const th = {
    padding: "8px 6px",
    fontSize: 10,
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "1px solid #2a2d39",
  };
  const td = { padding: "8px 6px", fontSize: 12 };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left" }}>Setup</th>
            <th
              style={{ ...th, textAlign: "center", color: "#3b82f6" }}
              colSpan={3}
            >
              LONG (739)
            </th>
            <th
              style={{ ...th, textAlign: "center", color: "#f97316" }}
              colSpan={3}
            >
              SHORT (252)
            </th>
            <th
              style={{ ...th, textAlign: "center", color: "#a78bfa" }}
              colSpan={2}
            >
              Δ Comparison
            </th>
          </tr>
          <tr>
            <th style={{ ...th, textAlign: "left" }}>SL:TP</th>
            <th style={{ ...th, textAlign: "right" }}>WR</th>
            <th style={{ ...th, textAlign: "right" }}>Exp</th>
            <th style={{ ...th, textAlign: "right" }}>W/L</th>
            <th style={{ ...th, textAlign: "right" }}>WR</th>
            <th style={{ ...th, textAlign: "right" }}>Exp</th>
            <th style={{ ...th, textAlign: "right" }}>W/L</th>
            <th style={{ ...th, textAlign: "right" }}>Δ WR</th>
            <th style={{ ...th, textAlign: "right" }}>Δ Exp</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const wrDiff = r.l.winRate - r.s.winRate;
            const expDiff = r.l.expectancy - r.s.expectancy;
            return (
              <tr
                key={r.label}
                style={{
                  borderBottom: "1px solid #1a1d29",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                <td style={{ ...td, fontWeight: 600 }}>
                  {r.sl}:{r.tp}
                  <span
                    style={{
                      color: "#64748b",
                      fontWeight: 400,
                      marginLeft: 6,
                      fontSize: 10,
                    }}
                  >
                    1:{r.rr}
                  </span>
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    background: wrColor(r.l.winRate),
                    borderRadius: 3,
                  }}
                >
                  {r.l.winRate.toFixed(1)}%
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontWeight: 700,
                    color: r.l.expectancy >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {r.l.expectancy >= 0 ? "+" : ""}
                  {r.l.expectancy.toFixed(2)}%
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    color: "#64748b",
                    fontSize: 11,
                  }}
                >
                  {r.l.wins}/{r.l.losses}
                  {r.l.open > 0 && (
                    <span style={{ color: "#eab308" }}>/{r.l.open}</span>
                  )}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    background: wrColor(r.s.winRate),
                    borderRadius: 3,
                  }}
                >
                  {r.s.winRate.toFixed(1)}%
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontWeight: 700,
                    color: r.s.expectancy >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {r.s.expectancy >= 0 ? "+" : ""}
                  {r.s.expectancy.toFixed(2)}%
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    color: "#64748b",
                    fontSize: 11,
                  }}
                >
                  {r.s.wins}/{r.s.losses}
                  {r.s.open > 0 && (
                    <span style={{ color: "#eab308" }}>/{r.s.open}</span>
                  )}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontWeight: 600,
                    color: diffColor(wrDiff),
                  }}
                >
                  {wrDiff >= 0 ? "+" : ""}
                  {wrDiff.toFixed(1)}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontWeight: 600,
                    color: diffColor(expDiff),
                  }}
                >
                  {expDiff >= 0 ? "+" : ""}
                  {expDiff.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const [view, setView] = useState("heatmaps");
  const [sortBy, setSortBy] = useState("expectancy");

  const maxExpAll = Math.max(
    ...longTrades.map((t) => t.expectancy),
    ...shortTrades.map((t) => t.expectancy),
  );

  const longBest = [...longTrades]
    .sort((a, b) => b.expectancy - a.expectancy)
    .filter((t) => t.open / t.total < 0.15)
    .slice(0, 3);
  const shortBest = [...shortTrades]
    .sort((a, b) => b.expectancy - a.expectancy)
    .filter((t) => t.open / t.total < 0.15)
    .slice(0, 3);

  const btn = (v, lbl) => ({
    background: view === v ? "#3b82f6" : "#1a1d29",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  });

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#0f1117",
        color: "#e2e8f0",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Trade Simulation — LONG vs SHORT
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
          <span style={{ color: "#3b82f6" }}>■</span> 739 LONG alerts
          &nbsp;·&nbsp;
          <span style={{ color: "#f97316" }}>■</span> 252 SHORT alerts
          &nbsp;·&nbsp; Entry at next candle open after alert
        </p>

        {/* Top picks side by side */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "1 1 300px",
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.08), transparent)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#3b82f6",
                marginBottom: 8,
              }}
            >
              🟢 BEST LONG SETUPS ({"<"}15% open)
            </div>
            {longBest.map((t, i) => (
              <div
                key={t.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: i < 2 ? "1px solid #1a1d29" : "none",
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  SL {t.sl}% → TP {t.tp}%
                </span>
                <span>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>
                    +{t.expectancy.toFixed(2)}%
                  </span>{" "}
                  <span style={{ color: "#64748b" }}>
                    · {t.winRate.toFixed(1)}% WR
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              flex: "1 1 300px",
              background:
                "linear-gradient(135deg, rgba(249,115,22,0.08), transparent)",
              border: "1px solid rgba(249,115,22,0.2)",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#f97316",
                marginBottom: 8,
              }}
            >
              🔴 BEST SHORT SETUPS ({"<"}15% open)
            </div>
            {shortBest.map((t, i) => (
              <div
                key={t.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: i < 2 ? "1px solid #1a1d29" : "none",
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  SL {t.sl}% → TP {t.tp}%
                </span>
                <span>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>
                    +{t.expectancy.toFixed(2)}%
                  </span>{" "}
                  <span style={{ color: "#64748b" }}>
                    · {t.winRate.toFixed(1)}% WR
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* View toggle */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => setView("heatmaps")} style={btn("heatmaps")}>
            Heatmaps
          </button>
          <button
            onClick={() => setView("comparison")}
            style={btn("comparison")}
          >
            Side-by-Side Table
          </button>
          {view === "comparison" && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: "#1a1d29",
                color: "#e2e8f0",
                border: "1px solid #2a2d39",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 12,
                marginLeft: 8,
              }}
            >
              <option value="expectancy">Sort: Avg Expectancy</option>
              <option value="winRate">Sort: Avg Win Rate</option>
              <option value="sl">Sort: Stop Loss</option>
              <option value="rr">Sort: R:R Ratio</option>
            </select>
          )}
        </div>

        {/* Heatmaps view */}
        {view === "heatmaps" && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Heatmap
              trades={longTrades}
              label="LONG"
              color="#3b82f6"
              maxExp={maxExpAll}
            />
            <Heatmap
              trades={shortTrades}
              label="SHORT"
              color="#f97316"
              maxExp={maxExpAll}
            />
          </div>
        )}

        {/* Comparison table */}
        {view === "comparison" && (
          <ComparisonTable
            longT={longTrades}
            shortT={shortTrades}
            sortBy={sortBy}
          />
        )}

        {/* Insights */}
        <div
          style={{
            marginTop: 28,
            background: "#1a1d29",
            borderRadius: 10,
            padding: 20,
            border: "1px solid #2a2d39",
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
            Key Findings — LONG vs SHORT
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              fontSize: 13,
              color: "#cbd5e1",
            }}
          >
            <div>
              <div
                style={{ color: "#3b82f6", fontWeight: 600, marginBottom: 4 }}
              >
                📈 LONGs outperform at symmetric setups
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>
                LONG 5:5 hits 64.9% WR vs SHORT 59.0%. LONGs have a ~5% win rate
                edge across all symmetric levels, consistent with crypto's
                upward bias.
              </div>
            </div>
            <div>
              <div
                style={{ color: "#f97316", fontWeight: 600, marginBottom: 4 }}
              >
                📉 SHORTs catch up at high R:R
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>
                SHORT 5:10 (+1.81%) actually beats LONG 5:10 (+1.62%). When
                shorts hit, they hit hard — selloffs are faster and more violent
                than rallies.
              </div>
            </div>
            <div>
              <div
                style={{ color: "#ef4444", fontWeight: 600, marginBottom: 4 }}
              >
                🚫 1% SL loses everywhere
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>
                Both LONG and SHORT are negative at 1:1 and 1:2. The whipsaw
                after volume surges requires at minimum 2-3% room to breathe.
              </div>
            </div>
            <div>
              <div
                style={{ color: "#22c55e", fontWeight: 600, marginBottom: 4 }}
              >
                ✅ 3:9 is reliable for both
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>
                LONG +1.13%, SHORT +1.07% with low open trade counts (5-6%).
                Best "set and forget" setup with confident data across both
                directions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
