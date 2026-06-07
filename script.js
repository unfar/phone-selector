// ============================================
// 📱 智能手机选购助手 — 核心逻辑
// ============================================

let phones = [];
let brandList = [];
let selectedBrands = new Set();
let selectedScreen = null;
let selectedCpu = new Set();
let selectedTags = new Set();
let selectedPriceRanges = new Set();
let selectedScreenSizes = new Set();
let currentSort = 'newest';
let expandedCards = new Set();

// ===== 对比功能变量 =====
let compareMode = false;
let compareList = [];



// ===== 配置 =====
const cpuTags = ["骁龙8 Elite 5","骁龙8 Elite 1","骁龙8 Gen5","天玑9500","麒麟9030","麒麟9020","天玑9400","麒麟9010s","A19","A18"];

// Brand logo data URIs (base64 SVG)
const brandLogos = {
  'Apple': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5BcHBsZTwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyLjE1MiA2Ljg5NmMtLjk0OCAwLTIuNDE1LTEuMDc4LTMuOTYtMS4wNC0yLjA0LjAyNy0zLjkxIDEuMTgzLTQuOTYxIDMuMDE0LTIuMTE3IDMuNjc1LS41NDYgOS4xMDMgMS41MTkgMTIuMDkgMS4wMTMgMS40NTQgMi4yMDggMy4wOSAzLjc5MiAzLjAzOSAxLjUyLS4wNjUgMi4wOS0uOTg3IDMuOTM1LS45ODcgMS44MzEgMCAyLjM1Ljk4NyAzLjk2Ljk0OCAxLjYzNy0uMDI2IDIuNjc2LTEuNDggMy42NzYtMi45NDggMS4xNTYtMS42ODggMS42MzYtMy4zMjUgMS42NjItMy40MTUtLjAzOS0uMDEzLTMuMTgyLTEuMjIxLTMuMjItNC44NTctLjAyNi0zLjA0IDIuNDgtNC40OTQgMi41OTctNC41NTktMS40MjktMi4wOS0zLjYyMy0yLjMyNC00LjM5LTIuMzc2LTItLjE1Ni0zLjY3NSAxLjA5LTQuNjEgMS4wOXpNMTUuNTMgMy44M2MuODQzLTEuMDEyIDEuNC0yLjQyNyAxLjI0NS0zLjgzLTEuMjA3LjA1Mi0yLjY2Mi44MDUtMy41MzIgMS44MTgtLjc4Ljg5Ni0xLjQ1NCAyLjMzOC0xLjI3MyAzLjcxNCAxLjMzOC4xMDQgMi43MTUtLjY4OCAzLjU1OS0xLjcwMSIvPjwvc3ZnPg==',
  'HONOR': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5Ib25vcjwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIuNjAxIDkuNzUzdjEuODIzSC44MDdWOS43NTNIMHY0LjQ5OGguODA3di0xLjg3NGgxLjc5NHYxLjg3NGguODA3VjkuNzUzaC0uODA3Wm0xOC42NzEuODAxaC44OThjLjM2OSAwIC42NjcuMjk3LjY2Ny42NjJhLjY2NS42NjUgMCAwIDEtLjY2Ny42NjNoLS44OTh2LTEuMzI1Wm0tLjgwNi0uODAxdjQuNDk4aC44MDZ2LTIuMDAybDEuNjggMi4wMDJIMjRsLTEuMzc2LTEuNjRhMS40NjIgMS40NjIgMCAwIDAtLjQ0NC0yLjg1OGgtMS43MTYuMDAyWm0tNy42My0uMDE0djIuODA3bC0xLjk1OS0yLjgwN2gtLjY0NHY0LjQ5OGguODA3di0yLjgybDEuOTY4IDIuODJoLjYzM1Y5LjczOWgtLjgwNVptLTcuNTMyIDIuMjZjMC0uODMyLjY4LTEuNTA2IDEuNTE3LTEuNTA2QTEuNTEgMS41MSAwIDAgMSA4LjMzNyAxMmMwIC44MzItLjY3OSAxLjUwNi0xLjUxNiAxLjUwNi0uNDAzIDAtLjc4OS0uMTU5LTEuMDczLS40NDFBMS41MDQgMS41MDQgMCAwIDEgNS4zMDQgMTJ2LS4wMDFaTTQuNDk3IDEyYzAgLjkzMy41NjYgMS43NzQgMS40MzQgMi4xMzIuODY5LjM1NyAxLjg2OC4xNiAyLjUzMy0uNS42NjQtLjY2Ljg2My0xLjY1My41MDMtMi41MTVhMi4zMjQgMi4zMjQgMCAwIDAtMi4xNDYtMS40MjUgMi4zMTYgMi4zMTYgMCAwIDAtMi4zMjMgMi4zMDdMNC40OTcgMTJabTExLjA0LS4wMDFhMS41MTMgMS41MTMgMCAwIDEgMS41MTgtMS41MDZjLjgzOCAwIDEuNTE2LjY3NSAxLjUxNiAxLjUwN2ExLjUxMyAxLjUxMyAwIDAgMS0xLjUxOCAxLjUwNmMtLjQwMiAwLS43ODgtLjE1OS0xLjA3Mi0uNDQxYTEuNSAxLjUgMCAwIDEtLjQ0NC0xLjA2NlpNMTQuNzMgMTJjMCAuOTMzLjU2NiAxLjc3NCAxLjQzNCAyLjEzMi44NjguMzU3IDEuODY4LjE2IDIuNTMyLS41LjY2NS0uNjYuODY0LTEuNjUzLjUwNC0yLjUxNWEyLjMyNSAyLjMyNSAwIDAgMC0yLjE0Ny0xLjQyNSAyLjMxNiAyLjMxNiAwIDAgMC0yLjMyMyAyLjMwN1YxMloiLz48L3N2Zz4K',
  'Huawei': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5IdWF3ZWk8L3RpdGxlPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zLjY3IDYuMTRTMS44MiA3LjkxIDEuNzIgOS43OHYuMzVjLjA4IDEuNTEgMS4yMiAyLjQgMS4yMiAyLjQgMS44MyAxLjc5IDYuMjYgNC4wNCA3LjMgNC41NSAwIDAgLjA2LjAzLjEtLjAxbC4wMi0uMDR2LS4wNEM3LjUyIDEwLjggMy42NyA2LjE0IDMuNjcgNi4xNHpNOS42NSAxOC42Yy0uMDItLjA4LS4xLS4wOC0uMS0uMDhsLTcuMzguMjZjLjggMS40MyAyLjE1IDIuNTMgMy41NiAyLjIuOTYtLjI1IDMuMTYtMS43OCAzLjg4LTIuMy4wNi0uMDUuMDQtLjA5LjA0LS4wOXptLjA4LS43OEM2LjQ5IDE1LjYzLjIxIDEyLjI4LjIxIDEyLjI4Yy0uMTUuNDYtLjIuOS0uMjEgMS4zdi4wN2MwIDEuMDcuNCAxLjgyLjQgMS44Mi44IDEuNjkgMi4zNCAyLjIgMi4zNCAyLjIuNy4zIDEuNC4zMSAxLjQuMzEuMTIuMDIgNC40IDAgNS41NCAwIC4wNSAwIC4wOC0uMDUuMDgtLjA1di0uMDZjMC0uMDMtLjAzLS4wNS0uMDMtLjA1ek05LjA2IDMuMTlhMy40MiAzLjQyIDAgMDAtMi41NyAzLjE1di40MWMuMDMuNi4xNiAxLjA1LjE2IDEuMDUuNjYgMi45IDMuODYgNy42NSA0LjU1IDguNjUuMDUuMDUuMS4wMy4xLjAzYS4xLjEgMCAwMC4wNi0uMWMxLjA2LTEwLjYtMS4xMS0xMy40Mi0xLjExLTEzLjQyLS4zMi4wMi0xLjE5LjIzLTEuMTkuMjN6bTguMjk5IDIuMjdzLS40OS0xLjgtMi40NC0yLjI4YzAgMC0uNTctLjE0LTEuMTctLjIyIDAgMC0yLjE4IDIuODEtMS4xMiAxMy40My4wMS4wNy4wNi4wOC4wNi4wOC4wNy4wMy4xLS4wMy4xLS4wMy43Mi0xLjAzIDMuOS01Ljc2IDQuNTUtOC42NCAwIDAgLjM2LTEuNC4wMi0yLjM0em0tMi45MiAxMy4wN3MtLjA3IDAtLjA5LjA1YzAgMC0uMDEuMDcuMDMuMS43LjUxIDIuODUgMiAzLjg4IDIuMyAwIDAgLjE2LjA1LjQzLjA2aC4xNGMuNjktLjAyIDEuOS0uMzcgMy0yLjI2bC03LjQtLjI1em03LjgzLTguNDFjLjE0LTIuMDYtMS45NC0zLjk3LTEuOTQtMy45OCAwIDAtMy44NSA0LjY2LTYuNjcgMTAuOCAwIDAtLjAzLjA4LjAyLjEzbC4wNC4wMWguMDZjMS4wNi0uNTMgNS40Ni0yLjc3IDcuMjgtNC41NCAwIDAgMS4xNS0uOTMgMS4yMS0yLjQyem0xLjUyIDIuMTRzLTYuMjggMy4zNy05LjUyIDUuNTVjMCAwLS4wNS4wNC0uMDMuMTEgMCAwIC4wMy4wNi4wNy4wNiAxLjE2IDAgNS41NiAwIDUuNjctLjAyIDAgMCAuNTctLjAyIDEuMjctLjI5IDAgMCAxLjU2LS41IDIuMzctMi4yNyAwIDAgLjczLTEuNDUuMTctMy4xNHoiLz48L3N2Zz4=',
  'Lenovo': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5MZW5vdm88L3RpdGxlPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMS4wNDQgMTIuMjg4YzAgLjUtLjM0My44NjctLjgxNS44NjctLjQ2NCAwLS44MjctLjM4LS44MjctLjg2NyAwLS41MS4zNDMtLjg2OC44MTUtLjg2OC40NjQgMCAuODI3LjM4MS44MjcuODY4em0tMTQuMzA1LS45MmEuNzg3Ljc4NyAwIDAgMC0uNjUxLjMwNy45OTEuOTkxIDAgMCAwLS4xNzIuNzM4bDEuNDc5LS42MTRhLjcwOC43MDggMCAwIDAtLjY1Ni0uNDN6bTYuOTYzLjA1MmMtLjQ3MiAwLS44MTYuMzU4LS44MTYuODY4IDAgLjQ4Ni4zNjQuODY3LjgyOC44NjcuNDcyIDAgLjgxNS0uMzY4LjgxNS0uODY3IDAtLjQ4Ny0uMzYzLS44NjgtLjgyNy0uODY4ek0yNCA3Ljk5N3Y4LjAwNkgwVjcuOTk3aDI0ek01LjAxIDEzLjA1SDMuMDg4VjkuODI1SDIuMjN2NC4wMDNoMi43OHYtLjc3N3ptMS4xMzctLjA5NGwyLjE2My0uODk3YTEuNjY3IDEuNjY3IDAgMCAwLS4zNy0uODZjLS4yODQtLjMzLS43MDQtLjUwNS0xLjIxNi0uNTA1LS45MzEgMC0xLjYzMy42ODYtMS42MzMgMS41OTMgMCAuOTMuNzA0IDEuNTkzIDEuNzI2IDEuNTkzLjU3MiAwIDEuMTU4LS4yNzIgMS40MzItLjU4OWwtLjUzNS0uNDExYy0uMzU3LjI2NC0uNTYuMzI2LS44ODUuMzI2LS4yOTIgMC0uNTItLjA5LS42ODItLjI1em01LjU3LTEuMDM5YzAtLjcwOS0uNTA3LTEuMjIzLTEuMjUyLTEuMjIzYTEuMjggMS4yOCAwIDAgMC0xLjAwNS40OTR2LS40NDJoLS44NDZ2My4wODFoLjg0NnYtMS43NTNjMC0uMzE2LjI0NS0uNjUxLjY5OC0uNjUxLjM1IDAgLjcxMi4yNDMuNzEyLjY1MXYxLjc1M2guODQ3di0xLjkxem0zLjY0Ny4zN2MwLS45MDQtLjcyNS0xLjU5My0xLjY1LTEuNTkzLS45MzMgMC0xLjY2My43LTEuNjYzIDEuNTkzIDAgLjkwMy43MjYgMS41OTIgMS42NTEgMS41OTIuOTMyIDAgMS42NjItLjcgMS42NjItMS41OTJ6bTIuMDY2IDEuNTRsMS4yNjgtMy4wODFoLS45NjdsLS43NjUgMi4wOTktLjc2NS0yLjFoLS45NjZsMS4yNjggMy4wODFoLjkyN3ptNC40NDktMS41NGMwLS45MDQtLjcyNS0xLjU5My0xLjY1LTEuNTkzLS45MzIgMC0xLjY2Mi43LTEuNjYyIDEuNTkzIDAgLjkwMy43MjUgMS41OTIgMS42NSAxLjU5Mi45MzIgMCAxLjY2Mi0uNyAxLjY2Mi0xLjU5MnoiLz48L3N2Zz4=',
  'Motorola': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5Nb3Rvcm9sYTwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJDMjQuMDAyIDUuMzc1IDE4LjYzMi4wMDIgMTIuMDA3IDBIMTJ6bTcuMzI3IDE4LjA2NXMtLjU4MS0yLjYyNy0xLjUyOC00LjE5N2MtLjUxNC0uODU3LTEuMzA4LTEuNTUzLTIuMzY4LTEuNTMyLS43NDUgMC0xLjM5OS40MjMtMi4yIDEuNTUzLS40NjkuNzctLjg4MiAxLjU3My0xLjIzNSAyLjQwMyAwIDAtLjI5LS42NzUtLjYzLTEuMzQzYTguMDM4IDguMDM4IDAgMCAwLS42MDUtMS4wNDljLS44MDQtMS4xMy0xLjQ1NS0xLjUzOS0yLjItMS41NTMtMS4wNDktLjAyMS0xLjg1NC42NzUtMi4zNjQgMS41MjgtLjk0OCAxLjU3NC0xLjUyOCA0LjE5Ny0xLjUyOCA0LjE5N2gtLjg2NGw0LjYwNi0xNS4xMiAzLjU2IDExLjgwNC4wMjQuMDIxLjAyNC0uMDIxIDMuNTYtMTEuODA0IDQuNjEgMTUuMTEzaC0uODYyeiIvPjwvc3ZnPg==',
  'OPPO': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgdmlld0JveD0iMCAwIDI4IDI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgcng9IjQiIGZpbGw9IiNmZmYiLz4KICA8cGF0aCBmaWxsPSIjMDAwIiBkPSJNMy44NSAxNS43ODZoLS4wMDFDMi42MzkgMTUuNzc0IDEuODU4IDE1LjIgMS44NTggMTQuMzIxcy43ODEtMS40NTIgMS45OS0xLjQ2NWMxLjIxLjAxMyAxLjk5Mi41ODggMS45OTIgMS40NjVzLS43ODIgMS40NTMtMS45OSAxLjQ2NXptLjAzNC0zLjYzOGgtLjA3M0MyLjE1NiAxMi4xNzUgMSAxMy4wNjggMSAxNC4zMnMxLjE1NiAyLjE0NyAyLjgxMSAyLjE3NGguMDczYzEuNjU1LS4wMjcgMi44MTEtLjkyMSAyLjgxMS0yLjE3NHMtMS4xNTYtMi4xNDYtMi44MTEtMi4xNzN6bTE4LjI3IDMuNjM4Yy0xLjIxLS4wMTItMS45OTItLjU4Ny0xLjk5Mi0xLjQ2NXMuNzgyLTEuNDUyIDEuOTkxLTEuNDY1YzEuMjEuMDEzIDEuOTkxLjU4OCAxLjk5MSAxLjQ2NXMtLjc4MSAxLjQ1My0xLjk5IDEuNDY1em0uMDM1LTMuNjM4aC0uMDczYy0xLjY1NS4wMjctMi44MTEuOTItMi44MTEgMi4xNzNzMS4xNTYgMi4xNDcgMi44MTEgMi4xNzRoLjA3M0MyMy44NDQgMTYuNDY4IDI1IDE1LjU3NCAyNSAxNC4zMnMtMS4xNTYtMi4xNDYtMi44MTEtMi4xNzN6bS02LjEyNiAzLjYzOGMtMS4yMS0uMDEyLTEuOTktLjU4Ny0xLjk5LTEuNDY1cy43OC0xLjQ1MiAxLjk5LTEuNDY1YzEuMjEuMDEzIDEuOTkxLjU4OCAxLjk5MSAxLjQ2NXMtLjc4MSAxLjQ1My0xLjk5IDEuNDY1em0uMDM2LTMuNjM4aC0uMDczYy0uNzg5LjAxMy0xLjQ2NC4yMjItMS45NTUuNTc0di0uMzdoLS44NTd2NS41aC44NTd2LTEuOTMxYy40OS4zNTEgMS4xNjYuNTYgMS45NTQuNTc0aC4wNzRjMS42NTUtLjAyNyAyLjgxLS45MjEgMi44MS0yLjE3NHMtMS4xNTUtMi4xNDYtMi44MS0yLjE3M3ptLTYuMTQ0IDMuNjM4Yy0xLjIxLS4wMTItMS45OS0uNTg3LTEuOTktMS40NjVzLjc4LTEuNDUyIDEuOTktMS40NjVjMS4yMS4wMTMgMS45OTEuNTg4IDEuOTkxIDEuNDY1cy0uNzgxIDEuNDUzLTEuOTkgMS40NjV6bS4wMzctMy42MzhoLS4wNzNjLS43ODkuMDEzLTEuNDY0LjIyMi0xLjk1NS41NzR2LS4zN2gtLjg1NnY1LjVoLjg1NnYtMS45MzFjLjQ5MS4zNTEgMS4xNjYuNTYgMS45NTUuNTc0YTMuNzI4IDMuNzI4IDAgMCAwIC4wNzMgMGMxLjY1NS0uMDI3IDIuODExLS45MjEgMi44MTEtMi4xNzRzLTEuMTU2LTIuMTQ2LTIuODEtMi4xNzN6Ii8+Cjwvc3ZnPg==',
  'OnePlus': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5PbmVQbHVzPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAzLjc0VjI0aDIwLjI2VjEyLjQyOGgtMi4yNTZ2OS4zMTdIMi4yNTRWNS45OTVoOS4zMThWMy43NDJ6TTE4LjAwNCAwdjMuNzRoLTMuNzU4djIuMjU2aDMuNzU4djMuNzU4aDIuMjU1VjUuOTk2SDI0VjMuNzRoLTMuNzU4VjB6bS02LjQ1IDE4Ljc1NlY4Ljg2Mkg5LjU2MmMwIC42ODItLjIyOCAxLjE4OS0uNTc3IDEuNTA0LS4zNjcuMjk3LS45MS40MzctMS41NTYuNDM3aC0uMjQ1djEuNjI1aDIuMTMzdjYuMzFoMi4yMzd6Ii8+PC9zdmc+',
  'REDMI': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2OCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDY4IDI0Ij4KICA8cmVjdCB3aWR0aD0iNjgiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz4KICA8dGV4dCB4PSIzNCIgeT0iMTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjE3IiBmaWxsPSIjZmZmIiBsZXR0ZXItc3BhY2luZz0iMiI+UkVETUk8L3RleHQ+Cjwvc3ZnPgo=',
  'RedMagic': 'data:image/png;base64,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',
  'Xiaomi': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5YaWFvbWk8L3RpdGxlPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xMiAwQzguMDE2IDAgNC43NTYuMjU1IDIuNDkzIDIuNTE2LjIzIDQuNzc2IDAgOC4wMzMgMCAxMi4wMTJjMCAzLjk4LjIzIDcuMjM1IDIuNDk0IDkuNDk3QzQuNzU3IDIzLjc3IDguMDE3IDI0IDEyIDI0YzMuOTgzIDAgNy4yNDMtLjIzIDkuNTA2LTIuNDkxQzIzLjc3IDE5LjI0NyAyNCAxNS45OSAyNCAxMi4wMTJjMC0zLjk4NC0uMjMzLTcuMjQzLTIuNTAyLTkuNTA0QzE5LjIzNC4yNTIgMTUuOTc4IDAgMTIgMHpNNC45MDYgNy40MDVoNS42MjRjMS40NyAwIDMuMDA3LjA2OCAzLjc2NC44MjcuNzQ2Ljc0Ni44MjcgMi4yMzMuODMgMy42NzZ2NC41NGEuMTUuMTUgMCAwIDEtLjE1Mi4xNDdoLTEuOTQ3YS4xNS4xNSAwIDAgMS0uMTUyLS4xNDhWMTEuODNjLS4wMDItLjgwNi0uMDQ4LTEuNjM0LS40NjQtMi4wNTEtLjM1OC0uMzYtMS4wMjYtLjQ0MS0xLjcyLS40NThINy4xNThhLjE1LjE1IDAgMCAwLS4xNTEuMTQ3djYuOThhLjE1LjE1IDAgMCAxLS4xNTIuMTQ4SDQuOTA2YS4xNS4xNSAwIDAgMS0uMTUtLjE0OFY3LjU1NGEuMTUuMTUgMCAwIDEgLjE1LS4xNDl6bTEyLjEzMSAwaDEuOTQ5YS4xNS4xNSAwIDAgMSAuMTUuMTV2OC44OTJhLjE1LjE1IDAgMCAxLS4xNS4xNDhoLTEuOTQ5YS4xNS4xNSAwIDAgMS0uMTUxLS4xNDhWNy41NTRhLjE1LjE1IDAgMCAxIC4xNTEtLjE0OXpNOC45MiAxMC45NDhoMi4wNDZjLjA4MyAwIC4xNS4wNjYuMTUuMTQ3djUuMzUyYS4xNS4xNSAwIDAgMS0uMTUuMTQ4SDguOTJhLjE1LjE1IDAgMCAxLS4xNTItLjE0OHYtNS4zNTJhLjE1LjE1IDAgMCAxIC4xNTItLjE0N1oiLz48L3N2Zz4=',
  'iQOO': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDY0IDI0Ij4KICA8cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz4KICA8dGV4dCB4PSIzMiIgeT0iMTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjIwIiBmaWxsPSIjMDAwIiBsZXR0ZXItc3BhY2luZz0iMiI+aVFPTzwvdGV4dD4KPC9zdmc+Cg==',
  'realme': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MiIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDcyIDI0Ij4KICA8cmVjdCB3aWR0aD0iNzIiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjZmZmIi8+CiAgPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjI0IiBmaWxsPSJub25lIi8+CiAgPHRleHQgeD0iMzYiIHk9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjcwMCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzAwMCIgbGV0dGVyLXNwYWNpbmc9IjIiPnJlYWxtZTwvdGV4dD4KPC9zdmc+Cg==',
  'Samsung': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDgwIDI0Ij4KICA8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz4KICA8dGV4dCB4PSI0MCIgeT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmIiBsZXR0ZXItc3BhY2luZz0iMiI+U0FNU1VORzwvdGV4dD4KPC9zdmc+Cg==',
  'vivo': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT52aXZvPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTkuNjA0IDE0LjEwMWMtMS4xNTkgMC0xLjI2Mi0uOTUtMS4yNjItMS4yNCAwLS4yOS4xMDMtMS4yNDIgMS4yNjItMS4yNDJoMi4wNjJjMS4xNiAwIDEuMjYzLjk1MSAxLjI2MyAxLjI0MiAwIC4yOS0uMTA0IDEuMjQtMS4yNjMgMS4yNG0tMi4wNjItMy41MjdjLTIuMTQyIDAtMi4zMzMgMS43NTItMi4zMzMgMi4yODcgMCAuNTM1LjE5IDIuMjg2IDIuMzMzIDIuMjg2aDIuMDYyYzIuMTQzIDAgMi4zMzQtMS43NTEgMi4zMzQtMi4yODYgMC0uNTM1LS4xOS0yLjI4Ny0yLjMzNC0yLjI4N20tNS40NzcuMTA3Yy0uMjg2IDAtLjM0NS4wNS0uNDU2LjIxMy0uMTEuMTY0LTIuMDIyIDMuMDgyLTIuMDIyIDMuMDgyLS4wNi4wOS0uMTI2LjEyNi0uMjA2LjEyNi0uMDggMC0uMTQ1LS4wMzYtLjIwNi0uMTI2IDAgMC0xLjkxMi0yLjkxOC0yLjAyMi0zLjA4Mi0uMTEtLjE2NC0uMTctLjIxMy0uNDU2LS4yMTNoLS42NjhjLS4xNTQgMC0uMjI0LjEyLS4xMjcuMjY3bDIuMjgzIDMuNDY3Yy4zNTQuNTIxLjYxNC43MzIgMS4xOTYuNzMycy44NDItLjIxIDEuMTk2LS43MzJsMi4yODQtMy40NjdjLjA5Ni0uMTQ2LjAyNi0uMjY3LS4xMjgtLjI2N20tOC44NzYuMjg0YzAtLjIwMy4wOC0uMjg0LjI4My0uMjg0aC41MDVjLjIwMyAwIC4yODMuMDguMjgzLjI4M3YzLjljMCAuMjAyLS4wOC4yODMtLjI4My4yODNoLS41MDVjLS4yMDMgMC0uMjgzLS4wOC0uMjgzLS4yODN6bS0xLjc2OS0uMjg1Yy0uMjg3IDAtLjM0Ni4wNS0uNDU2LjIxMy0uMTEuMTY0LTIuMDIyIDMuMDgyLTIuMDIyIDMuMDgyLS4wNjEuMDktLjEyNi4xMjYtLjIwNi4xMjYtLjA4IDAtLjE0NS0uMDM2LS4yMDYtLjEyNiAwIDAtMS45MTItMi45MTgtMi4wMjMtMy4wODItLjExLS4xNjQtLjE2OS0uMjEzLS40NTUtLjIxM0guMTc1Yy0uMTcxIDAtLjIyNC4xMi0uMTI3LjI2N2wyLjI4MyAzLjQ2N2MuMzU1LjUyMS42MTUuNzMyIDEuMTk3LjczMi41ODIgMCAuODQyLS4yMSAxLjE5Ni0uNzMybDIuMjgzLTMuNDY3Yy4wOTctLjE0Ni4wNDQtLjI2Ny0uMTI3LS4yNjdtMS4wNTUtLjg5M2MtLjE2NS0uMTY0LS4xNjUtLjI5NSAwLS40NmwuMzUxLS4zNTFjLjE2NS0uMTY1LjI5Ni0uMTY1LjQ2IDBsLjM1Mi4zNTFjLjE2NS4xNjUuMTY1LjI5NiAwIC40NmwtLjM1Mi4zNTJjLS4xNjQuMTY1LS4yOTUuMTY1LS40NiAweiIvPjwvc3ZnPg==',
};
// 一些品牌需要使用更大的 logo
const largeLogoBrands = new Set(['OPPO','vivo','RedMagic']);
const textLogoBrands = new Set(['Samsung','OPPO','REDMI','iQOO','HONOR','vivo','realme']);
function getLogoStyle(brand) {
    return largeLogoBrands.has(brand) ? 'height:32px;width:auto' : 'height:22px;width:auto';
}
const featureTags = ["潜望长焦","6500mAh+","≤200g","防水","NFC","红外","USB3.0","无线充电","散热风扇","有线投屏"];
const tagDisplayNames = {"6500mAh+":"6500mAh+","≤200g":"≤200g"};
const priceRanges = [
    { name: "<1k", min: 0, max: 999 },
    { name: "1-2k", min: 1000, max: 1999 },
    { name: "2-3k", min: 2000, max: 2999 },
    { name: "3-4k", min: 3000, max: 3999 },
    { name: "4-5k", min: 4000, max: 4999 },
    { name: "5-6k", min: 5000, max: 5999 },
    { name: "6-7k", min: 6000, max: 6999 },
    { name: "7-8k", min: 7000, max: 7999 },
    { name: "8-9k", min: 8000, max: 8999 },
    { name: "9-10k", min: 9000, max: 9999 },
    { name: ">1w", min: 10000, max: 999999 }
];
const screenSizeRanges = [
    { name: "6英寸左右", min: 5.7, max: 6.3 },
    { name: "6.5英寸左右", min: 6.2, max: 6.8 },
    { name: "7英寸左右", min: 6.7, max: 7.5 }
];
const screenTypes = ['📱 直屏','🔄 折叠屏'];
const brandEnglishMap = {
    "苹果": "Apple",
    "三星": "Samsung",
    "摩托罗拉": "Motorola"
};
function getEnglishBrand(zh) { return brandEnglishMap[zh] || zh; }


// ===== 数据加载 =====
async function loadData() {
    try {
        showLoading();
        const resp = await fetch('data/phones.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        phones = await resp.json();
        // 初始化品牌列表，确保后续渲染时有数据
        brandList = [...new Set(phones.map(p => p.brand))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        hideLoading();
        restoreStateFromHash();
        init();
    } catch (err) {
        hideLoading();
        document.getElementById('phoneGrid').innerHTML =
            `<div class="error-msg"><div class="emoji">😢</div><p>数据加载失败：${err.message}</p><p style="margin-top:8px;font-size:.85rem">请检查网络连接或刷新页面重试</p></div>`;
    }
}

function showLoading() {
    const grid = document.getElementById('phoneGrid');
    grid.innerHTML = '<div class="loading"><div class="spinner">⏳</div><p>加载数据中...</p></div>';
}

function hideLoading() {
    const grid = document.getElementById('phoneGrid');
    grid.innerHTML = grid.innerHTML.replace('<div class="loading"><div class="spinner">⏳</div><p>加载数据中...</p></div>', '');
}

// ===== URL Hash 状态管理 =====
function updateHash() {
    const params = new URLSearchParams();
    if (selectedBrands.size > 0) params.set('brands', [...selectedBrands].join(','));
    if (selectedScreen) params.set('screen', selectedScreen);
    if (selectedCpu.size > 0) params.set('cpu', [...selectedCpu].join(','));
    if (selectedTags.size > 0) params.set('tags', [...selectedTags].join(','));
    if (selectedPriceRanges.size > 0) params.set('priceRange', [...selectedPriceRanges].join(','));
    if (selectedScreenSizes.size > 0) params.set('screenSize', [...selectedScreenSizes].join(','));
    if (currentSort !== 'newest') params.set('sort', currentSort);
    const hash = params.toString();
    history.replaceState(null, '', `#${hash}`);
}

function restoreStateFromHash() {
    const hash = location.hash.slice(1);
    const sortSelect = document.getElementById('sortSelect');
    
    if (!hash) {
        // 无 hash 时也要同步默认排序到下拉菜单
        if (sortSelect) sortSelect.value = currentSort;
        return;
    }
    
    const params = new URLSearchParams(hash);
    const brands = params.get('brands');
    if (brands) brands.split(',').forEach(b => selectedBrands.add(b));
    selectedScreen = params.get('screen') || null;
    const cpu = params.get('cpu');
    if (cpu) cpu.split(',').forEach(c => selectedCpu.add(c));
    const tags = params.get('tags');
    if (tags) tags.split(',').forEach(t => selectedTags.add(t));
    const priceRanges = params.get('priceRange');
    if (priceRanges) priceRanges.split(',').forEach(r => selectedPriceRanges.add(r));
    const screenSizes = params.get('screenSize');
    if (screenSizes) screenSizes.split(',').forEach(s => selectedScreenSizes.add(s));
    currentSort = params.get('sort') || 'newest';
    if (sortSelect) sortSelect.value = currentSort;
}

// ===== 筛选逻辑 =====
function matchesFilters(p) {
    if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;
    if (selectedScreen) {
        const screenVal = selectedScreen.replace(/^\S+\s*/, '');
        if (p.screen_form !== screenVal) return false;
    }
    if (selectedCpu.size > 0) { let has = false; for (let c of selectedCpu) if (p.tags.includes(c)) { has = true; break; } if (!has) return false; }
    const tagsRequireBoth = new Set(['NFC', '红外', 'USB3.0', '无线充电', '防水', '潜望长焦', '6500mAh+', '≤200g', '散热风扇', '有线投屏']);
    for (let t of selectedTags) {
        if (tagsRequireBoth.has(t)) {
            const inTags = p.tags.includes(t);
            const inFeatures = (p.features || []).some(f => f.includes(t));
            if (!inTags && !inFeatures) return false;
        } else {
            if (!p.tags.includes(t)) return false;
        }
    }
    // 价格范围筛选（多选，任一匹配即可）
    if (selectedPriceRanges.size > 0) {
        let inRange = false;
        for (let r of selectedPriceRanges) {
            const range = priceRanges.find(pr => pr.name === r);
            if (range && p.price >= range.min && p.price <= range.max) { inRange = true; break; }
        }
        if (!inRange) return false;
    }
    // 屏幕尺寸筛选（多选，任一匹配即可）
    if (selectedScreenSizes.size > 0) {
        let inSize = false;
        for (let s of selectedScreenSizes) {
            const range = screenSizeRanges.find(sr => sr.name === s);
            if (range && p.screen_size >= range.min && p.screen_size <= range.max) { inSize = true; break; }
        }
        if (!inSize) return false;
    }
    return true;
}

// ===== 排序逻辑 =====
function normDate(d) {
    if (!d) return '';
    if (d.length === 7) return d + '-01';  // YYYY-MM → YYYY-MM-01（月初）
    return d;
}

/** 从机型名提取系列名（如一加 Ace 5 Pro → 一加 Ace 5）*/
function getSeriesName(model) {
    let s = model.trim();

    // 中文特殊后缀
    s = s.replace(/ (RS 非凡大师|RSR保时捷|风驰版|徕卡版|至尊版|元气版|保时捷设计|保时捷)$/, '');
    s = s.replace(/ 优享版$/, '');

    // 内存版本如 (16GB)、(12GB)
    s = s.replace(/ \(\d+GB\)$/, '');

    // 英文后缀（带空格，最长优先匹配）
    const engSuffixes = [
        ' Pro Max', ' Pro mini', ' Pro+', ' Ultra', ' Pro',
        ' Plus', ' Max', ' Mini', ' Lite', ' SE', ' FE', ' Note', ' Turbo'
    ];
    for (const suff of engSuffixes) {
        if (s.endsWith(suff)) {
            s = s.slice(0, -suff.length).trim();
            break;
        }
    }

    // 单字母后缀（数字后接 z/T/s/c/+ 等，如 nova16z → nova16）
    while (/[0-9][zTs+c]$/.test(s)) {
        s = s.slice(0, -1);
    }

    return s.trim();
}

function sortPhones(list) {
    const s = [...list];
    switch (currentSort) {
        case 'newest': 
            s.sort((a, b) => {
                const dateCmp = normDate(b.release_date).localeCompare(normDate(a.release_date));
                if (dateCmp !== 0) return dateCmp;
                // 同日期：按品牌+系列分组
                const seriesA = a.brand + '|' + getSeriesName(a.model);
                const seriesB = b.brand + '|' + getSeriesName(b.model);
                const seriesCmp = seriesA.localeCompare(seriesB);
                if (seriesCmp !== 0) return seriesCmp;
                // 同系列：按价格低→高
                return (a.price || 99999) - (b.price || 99999);
            });
            break;
        case 'price_asc': s.sort((a, b) => (a.price || 99999) - (b.price || 99999)); break;
        case 'price_desc': s.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
        case 'battery_desc': s.sort((a, b) => b.battery_mah - a.battery_mah); break;
        case 'weight_asc': s.sort((a, b) => (a.weight_g || 9999) - (b.weight_g || 9999)); break;
        case 'screen_desc': s.sort((a, b) => b.screen_size - a.screen_size); break;
        case 'charging_desc': s.sort((a, b) => b.charging_w - a.charging_w); break;
        case 'brand_asc': s.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)); break;
    }
    return s;
}

// ===== 折叠屏屏幕显示 =====
function getFoldableScreenDisplay(phone) {
    // 检查是否是折叠屏
    if (phone.screen_unfolded && phone.screen_folded) {
        const unfolded = phone.screen_unfolded;
        const folded = phone.screen_folded;
        const foldType = phone.fold_type || '折叠屏';
        
        let display = '';
        
        if (foldType === '三折叠') {
            display = `三折叠 ${unfolded.size}英寸/${folded.size}英寸`;
        } else if (foldType === '横向折叠') {
            display = `横折 ${unfolded.size}英寸/${folded.size}英寸`;
        } else if (foldType === '纵向折叠') {
            display = `竖折 ${unfolded.size}英寸/${folded.size}英寸`;
        } else {
            display = `${unfolded.size}英寸/${folded.size}英寸`;
        }
        
        return display;
    }
    
    // 非折叠屏，使用原有逻辑
    return (phone.screen_size ? phone.screen_size + '英寸' : '') + (phone.screen_type ? ' ' + phone.screen_type : '') || '—';
}

// ===== 折叠屏分辨率显示 =====
function getFoldableResolutionDisplay(phone) {
    if (phone.screen_unfolded && phone.screen_folded) {
        const unfolded = phone.screen_unfolded;
        const folded = phone.screen_folded;
        return `${unfolded.resolution || '—'} / ${folded.resolution || '—'}`;
    }
    return phone.resolution || '—';
}

// ===== 折叠屏刷新率显示 =====
function getFoldableRefreshDisplay(phone) {
    if (phone.screen_unfolded && phone.screen_folded) {
        const unfolded = phone.screen_unfolded;
        const folded = phone.screen_folded;
        return `${unfolded.refresh_hz || '—'}Hz / ${folded.refresh_hz || '—'}Hz`;
    }
    return phone.refresh_hz ? phone.refresh_hz + 'Hz' : '—';
}

// ===== 渲染统计 =====
function renderStats() {
    const total = phones.length;
    const brands = new Set(phones.map(p => p.brand)).size;
    document.getElementById('statBrands').textContent = brands;
    document.getElementById('statPhones').textContent = total;
}

// ===== 渲染筛选标签 =====
function brandCount(brand) { return phones.filter(p => p.brand === brand).length; }
function getTagDisplayName(tag) { return tagDisplayNames[tag] || tag; }

function renderBrandTags() {
    const c = document.getElementById('brandTags'); c.innerHTML = '';
    brandList.forEach(b => {
        const count = brandCount(b);
        const el = document.createElement('span');
        el.className = 'tag' + (selectedBrands.has(b) ? ' active brand-active-' + b : '');
        el.textContent = getEnglishBrand(b);
        el.dataset.count = count;
        el.onclick = () => { selectedBrands.has(b) ? selectedBrands.delete(b) : selectedBrands.add(b); updateHash(); refresh(); };
        c.appendChild(el);
    });
    const filtered = phones.filter(p => matchesFilters(p));
    document.getElementById('brandCount').textContent = `(${filtered.length} 款)`;
}

function renderScreenTags() {
    const c = document.getElementById('screenTags'); c.innerHTML = '';
    screenTypes.forEach(s => {
        const el = document.createElement('span');
        el.className = 'tag screen' + (selectedScreen === s ? ' active' : '');
        el.textContent = s;
        el.onclick = () => { 
            selectedScreen = selectedScreen === s ? null : s; 
            if (selectedScreen === '🔄 折叠屏') selectedScreenSizes.clear();
            updateHash(); refresh(); 
        };
        c.appendChild(el);
    });
}

function renderCpuTags() {
    const c = document.getElementById('cpuTags'); c.innerHTML = '';
    cpuTags.forEach(t => {
        const el = document.createElement('span');
        el.className = 'tag cpu' + (selectedCpu.has(t) ? ' active' : '');
        el.textContent = t;
        el.onclick = () => { selectedCpu.has(t) ? selectedCpu.delete(t) : selectedCpu.add(t); updateHash(); refresh(); };
        c.appendChild(el);
    });
}

function renderFeatureTags() {
    const c = document.getElementById('featureTags'); 
    c.innerHTML = '';
    featureTags.forEach(t => {
        const el = document.createElement('span');
        el.className = 'tag' + (selectedTags.has(t) ? ' active' : '');
        el.textContent = getTagDisplayName(t);
        el.onclick = () => { 
            selectedTags.has(t) ? selectedTags.delete(t) : selectedTags.add(t); 
            updateHash(); 
            refresh(); 
        };
        c.appendChild(el);
    });
}

function renderPriceRangeTags() {
    const container = document.getElementById('priceRangeTags');
    container.innerHTML = '';
    priceRanges.forEach(range => {
        const el = document.createElement('span');
        el.className = 'tag' + (selectedPriceRanges.has(range.name) ? ' active' : '');
        el.textContent = range.name;
        el.onclick = () => {
            selectedPriceRanges.has(range.name) ? selectedPriceRanges.delete(range.name) : selectedPriceRanges.add(range.name);
            updateHash();
            refresh();
        };
        container.appendChild(el);
    });
}

function renderScreenSizeTags() {
    const container = document.getElementById('screenSizeTags');
    container.innerHTML = '';
    screenSizeRanges.forEach(range => {
        const el = document.createElement('span');
        el.className = 'tag' + (selectedScreenSizes.has(range.name) ? ' active' : '');
        el.textContent = range.name;
        el.onclick = () => {
            selectedScreenSizes.has(range.name) ? selectedScreenSizes.delete(range.name) : selectedScreenSizes.add(range.name);
            if (selectedScreen === '🔄 折叠屏') selectedScreen = null;
            updateHash();
            refresh();
        };
        container.appendChild(el);
    });
}

// ===== 当前筛选栏 =====
function renderActiveBar() {
    const bar = document.getElementById('activeBar'), badges = document.getElementById('activeBadges');
    const total = selectedBrands.size + (selectedScreen ? 1 : 0) + selectedCpu.size + selectedTags.size + selectedPriceRanges.size + selectedScreenSizes.size;
    if (total === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex'; badges.innerHTML = '';
    selectedBrands.forEach(b => addBadge(badges, getEnglishBrand(b), () => { selectedBrands.delete(b); updateHash(); refresh(); }));
    if (selectedScreen) addBadge(badges, selectedScreen, () => { selectedScreen = null; updateHash(); refresh(); });
    selectedCpu.forEach(c => addBadge(badges, c, () => { selectedCpu.delete(c); updateHash(); refresh(); }));
    selectedTags.forEach(t => addBadge(badges, getTagDisplayName(t), () => { selectedTags.delete(t); updateHash(); refresh(); }));
    selectedPriceRanges.forEach(r => addBadge(badges, r, () => { selectedPriceRanges.delete(r); updateHash(); refresh(); }));
    selectedScreenSizes.forEach(s => addBadge(badges, s, () => { selectedScreenSizes.delete(s); updateHash(); refresh(); }));
}

function addBadge(c, t, r) {
    const el = document.createElement('span');
    el.className = 'active-badge';
    el.innerHTML = t + ' <span class="x">✕</span>';
    el.querySelector('.x').onclick = r;
    c.appendChild(el);
}

// ===== 渲染手机卡片 =====
function renderPhones() {
    const filtered = sortPhones(phones.filter(matchesFilters));
    const grid = document.getElementById('phoneGrid');
    document.getElementById('resultCount').textContent = filtered.length;

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results"><div class="emoji">🔍</div><p>没有找到符合条件的手机</p><p style="margin-top:8px;font-size:.85rem;color:var(--text-muted)">试试减少筛选条件、更换品牌或调整价格范围～</p></div>';
        return;
    }

    // 品牌分区颜色映射
    const brandAccentColors = {
        'Apple':'#1a1a2e','Huawei':'#BC2D32','Xiaomi':'#FF4800',
        'OPPO':'#6DFB73','vivo':'#7C3AED','Samsung':'#2563eb',
        'HONOR':'#222222','REDMI':'#D82F44','iQOO':'#FFD700',
        'OnePlus':'#E73421','realme':'#EAB51D','RedMagic':'#b91c1c',
        'Motorola':'#D43D2D','Lenovo':'#D43D2D'
    };

    let cardsHtml = '';
    
    // 直接按排序顺序渲染（已按日期→价格排序），不按品牌分组
    filtered.forEach(p => {
        const isCompareSelected = compareList.includes(p.id);
        const isExpanded = expandedCards.has(p.id);
        const priceHtml = p.price ? '<span class="price-badge">¥' + p.price + '</span>' : '';

        const displayName = (() => {
            const m = p.model, b = p.brand;
            // Case-insensitive brand prefix check
            if (m.toLowerCase().startsWith(b.toLowerCase())) return m;
            // Known brand prefixes already in model name
            if (m.startsWith('iPhone') || m.startsWith('Galaxy') || m.startsWith('moto') || m.startsWith('Moto')) return m;
            // Chinese brand name already in model
            if ((b === 'Huawei' || b === 'HONOR' || b === 'OnePlus' || b === 'RedMagic' || b === 'Lenovo') && /^[一荣耀华红拯]/.test(m)) return m;
            if (b === 'OPPO' || b === 'REDMI') return m; // models already include brand
            // Prepend brand for bare model names (e.g. GT8, 13 Pro, S21)
            return b + ' ' + m;
        })();

        const sc = [
            { l: '处理器', v: p.processor || '—' },
            { l: '内存/存储', v: (p.ram && p.storage) ? p.ram + ' + ' + p.storage : (p.ram || p.storage || '—') },
            { l: '屏幕', v: getFoldableScreenDisplay(p) || '—' },
            { l: '电池', v: p.battery_mah ? p.battery_mah + 'mAh' : '—' },
            { l: '有线充电', v: p.charging_w ? p.charging_w + 'W' : '—' },
            { l: '无线充电', v: p.wireless_charging_w ? p.wireless_charging_w + 'W' : '不支持' },
            { l: 'USB', v: p.usb_version || '—' },
            { l: '重量', v: p.weight_g ? p.weight_g + 'g' : '—' }
        ];

        let detailHtml = '';
        if (p.detailed_camera) detailHtml += '<div class="detail-section"><div class="detail-title">📷 影像系统</div><div class="detail-row">' + p.detailed_camera + '</div></div>';
        if (!p.detailed_camera && p.camera_desc) detailHtml += '<div class="detail-section"><div class="detail-title">📷 影像系统</div><div class="detail-row">' + p.camera_desc + '</div></div>';

        const ft = [];
        // 仅展示特性标签中的标签（潜望长焦/6500mAh+/≤200g/防水/NFC/红外/USB3.0/无线充电/散热风扇/有线投屏）
        if (p.has_tele) ft.push({ t: '🔭 潜望长焦', c: 'purple' });
        if (p.tags.includes('无线充电')) ft.push({ t: '🔋 无线充电', c: 'green' });
        if (p.tags.includes('散热风扇')) ft.push({ t: '🌀 散热风扇', c: 'red' });
        // 防水（显示具体 IP 等级）
        const ipRating = (p.features || []).find(f => f.includes('IP68') || f.includes('IP69'));
        if (ipRating) ft.push({ t: '💧 ' + ipRating, c: 'blue' });
        // NFC
        if (p.tags.includes('NFC') || (p.features || []).some(f => f.includes('NFC'))) ft.push({ t: '📡 NFC', c: '' });
        // 红外
        if (p.tags.includes('红外') || (p.features || []).some(f => f.includes('红外'))) ft.push({ t: '🔴 红外', c: 'amber' });
        // USB 3.0
        if (p.tags.includes('USB3.0') || (p.features || []).includes('USB3.0')) ft.push({ t: '🔌 USB 3.0', c: '' });
        // 6500mAh+
        if (p.tags.includes('6500mAh+') || (p.features || []).includes('6500mAh+')) ft.push({ t: '🔋 6500mAh+', c: 'green' });
        // ≤200g
        if (p.tags.includes('≤200g') || (p.features || []).includes('≤200g')) ft.push({ t: '🪶 ≤200g', c: 'green' });
        // 有线投屏
        if (p.tags.includes('有线投屏') || (p.features || []).includes('有线投屏')) ft.push({ t: '🖥️ 有线投屏', c: '' });
        const fh = ft.length > 0 ? '<div class="card-footer">' + ft.map(f => '<span class="feature-tag ' + f.c + '">' + f.t + '</span>').join('') + '</div>' : '';

        const cardClass = ['phone-card'];
        cardClass.push('brand-border-' + p.brand);
        if (isCompareSelected) cardClass.push('compare-selected');
        if (compareMode) cardClass.push('compare-clickable');

        cardsHtml += '<div class="' + cardClass.join(' ') + '" data-id="' + p.id + '">' +
            '<div class="card-header brand-header-' + p.brand + '">' +
                '<div class="card-header-top">' +
                    '<span class="brand-badge">' + (textLogoBrands.has(p.brand)
                        ? '<span class="brand-text-logo">' + p.brand + '</span>'
                        : '<img class="brand-logo" style="' + getLogoStyle(p.brand) + '" src="' + brandLogos[p.brand] + '" alt="' + p.brand + '">') + '</span>' +
                    priceHtml +
                '</div>' +
                '<div class="phone-name">' + displayName + '</div>' +
            '</div>' +
            '<div class="card-body">' +
                '<div class="spec-grid">' + sc.map(s => '<div class="spec-cell"><div class="label">' + s.l + '</div><div class="value' + (s.v === '不支持' || s.v === '—' ? ' unsupported' : '') + '">' + s.v + '</div></div>').join('') + '</div>' +
                '<div class="card-expand"><button class="expand-btn" data-id="' + p.id + '">' + (isExpanded ? '收起 ▲' : '展开详情 ▼') + '</button></div>' +
                '<div class="card-details ' + (isExpanded ? 'open' : '') + '">' + detailHtml + '</div>' +
            '</div>' + fh +
        '</div>';
    });
    grid.innerHTML = cardsHtml;

    bindCardEvents();
}

// ===== 卡片事件绑定 =====
function bindCardEvents() {
    // 卡片点击 - 对比模式下选中/取消选中
    document.querySelectorAll('.phone-card').forEach(card => {
        card.onclick = (e) => {
            if (e.target.closest('.expand-btn')) return;
            if (compareMode) {
                const id = parseInt(card.dataset.id);
                toggleCompareSelection(id);
            }
        };
    });

    // 展开/收起
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (expandedCards.has(id)) {
                expandedCards.delete(id);
            } else {
                expandedCards.add(id);
            }
            refresh();
        };
    });
}

// ===== 对比功能 =====
function toggleCompareMode() {
    compareMode = !compareMode;
    const btn = document.getElementById('compareModeBtn');

    if (compareMode) {
        btn.classList.add('active');
        btn.textContent = '📊 退出对比';
    } else {
        btn.classList.remove('active');
        btn.textContent = '📊 机型对比';
        compareList = [];
        updateCompareBar();
        document.getElementById('comparePanel').style.display = 'none';
    }
    refresh();
}

function toggleCompareSelection(id) {
    if (!compareMode) return;

    const idx = compareList.indexOf(id);
    if (idx >= 0) {
        compareList.splice(idx, 1);
    } else {
        if (compareList.length >= 4) {
            alert('最多只能对比 4 款机型哦～');
            return;
        }
        compareList.push(id);
    }

    updateCompareBar();
    refresh();
}

function updateCompareBar() {
    const bar = document.getElementById('compareBar');
    const countEl = document.getElementById('compareBarCount');
    const selectedEl = document.getElementById('compareBarSelected');
    const startBtn = document.getElementById('compareBarStart');

    countEl.textContent = compareList.length;

    if (compareList.length > 0) {
        bar.style.display = 'block';
    } else {
        bar.style.display = 'none';
    }

    const selectedPhones = compareList.map(id => phones.find(p => p.id === id)).filter(Boolean);
    selectedEl.innerHTML = selectedPhones.map(p =>
        `<span class="selected-chip">${p.model}<span class="remove" data-id="${p.id}">✕</span></span>`
    ).join('');

    selectedEl.querySelectorAll('.remove').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            toggleCompareSelection(id);
        };
    });

    startBtn.disabled = compareList.length < 2;
}

function startCompare() {
    console.log('开始对比，当前对比列表长度:', compareList.length);
    if (compareList.length < 2) {
        console.log('对比机型数量不足，需要至少2款');
        return;
    }
    console.log('开始渲染对比面板');
    renderComparePanel();
    const panel = document.getElementById('comparePanel');
    if (panel) {
        panel.style.display = 'flex';
        console.log('对比面板已显示');
    } else {
        console.error('未找到对比面板元素');
    }
}

function clearCompareSelection() {
    compareList = [];
    updateCompareBar();
    document.getElementById('comparePanel').style.display = 'none';
    refresh();
}

function renderComparePanel() {
    const selected = phones.filter(p => compareList.includes(p.id));
    if (selected.length < 2) return;

    const fields = [
        { l: '💰 价格', v: p => p.price ? '¥' + p.price : '—', best: 'min' },
        { l: '⚡ 处理器', v: p => p.processor || '—' },
        { l: '🧠 内存', v: p => p.ram || '—' },
        { l: '💾 存储', v: p => p.storage || '—' },
        { l: '📺 屏幕', v: p => getFoldableScreenDisplay(p) || '—' },
        { l: '🎨 分辨率', v: p => getFoldableResolutionDisplay(p) || '—' },
        { l: '🔄 刷新率', v: p => getFoldableRefreshDisplay(p) || '—', best: 'max' },
        { l: '🔋 电池', v: p => p.battery_mah ? p.battery_mah + 'mAh' : '—', best: 'max' },
        { l: '🔌 有线充电', v: p => p.charging_w ? p.charging_w + 'W' : '—', best: 'max' },
        { l: '📶 无线充电', v: p => p.wireless_charging_w ? p.wireless_charging_w + 'W' : '不支持', best: 'max' },
        { l: '🔗 USB', v: p => p.usb_version || '—' },
        { l: '⚖️ 重量', v: p => p.weight_g ? p.weight_g + 'g' : '—', best: 'min' },
        { l: '📱 系统', v: p => p.os || '—' },
        { l: '📐 屏幕形态', v: p => p.screen_form || '—' },
        { l: '💧 防水', v: p => {
            const tags = p.tags || [];
            const feats = p.features || [];
            if (tags.includes('防水') || feats.some(f => f.includes('IP68') || f.includes('IP69'))) return '✅ 支持';
            return '—';
        }},
        { l: '📡 NFC', v: p => {
            const tags = p.tags || [];
            const feats = p.features || [];
            if (tags.includes('NFC') || feats.some(f => f.includes('NFC'))) return '✅ 支持';
            return '—';
        }},
        { l: '🔴 红外', v: p => {
            const tags = p.tags || [];
            const feats = p.features || [];
            if (tags.includes('红外') || feats.some(f => f.includes('红外'))) return '✅ 支持';
            return '—';
        }},
        { l: '📷 潜望长焦', v: p => p.has_tele ? '✅ 支持' : '—' },
        { l: '🖥️ 有线投屏', v: p => {
            const tags = p.tags || [];
            const feats = p.features || [];
            if (tags.includes('有线投屏') || feats.some(f => f.includes('有线投屏'))) return '✅ 支持';
            return '—';
        }},
        { l: '📅 发布日期', v: p => p.release_date || '—' },
    ];

    // 找出每个参数的最佳值
    const bestValues = {};
    fields.forEach(f => {
        if (f.best) {
            const values = selected.map(p => {
                const val = f.v(p);
                // 提取数字进行比较
                const numMatch = val.match(/(\d+)/);
                return numMatch ? parseInt(numMatch[1]) : 0;
            });
            
            if (f.best === 'min') {
                bestValues[f.l] = Math.min(...values);
            } else if (f.best === 'max') {
                bestValues[f.l] = Math.max(...values);
            }
        }
    });

    let html = '<table class="compare-table"><thead><tr><th><span class="param-label">参数</span></th>';
    selected.forEach(p => {
        html += '<th><div class="phone-name-badge">' + p.model + '</div><small style="opacity:.8;display:block;margin-top:4px">' + getEnglishBrand(p.brand) + '</small><button class="compare-remove" data-id="' + p.id + '">✕ 移除</button></th>';
    });
    html += '</tr></thead><tbody>';
    fields.forEach(f => {
        html += '<tr><th>' + f.l + '</th>';
        selected.forEach(p => {
            const value = f.v(p);
            let displayValue = value;
            
            // 检查是否是最佳值
            if (f.best && bestValues[f.l]) {
                const numMatch = value.match(/(\d+)/);
                if (numMatch) {
                    const numValue = parseInt(numMatch[1]);
                    if (numValue === bestValues[f.l]) {
                        displayValue = '<span class="best">' + value + '</span> 🏆';
                    }
                }
            }
            
            html += '<td class="' + (value === '不支持' || value === '—' ? 'unsupported' : '') + '">' + displayValue + '</td>';
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    // 保留雷达图容器
    html += '<div id="radarChartContainer" style="display:none; margin-bottom:20px;"><canvas id="radarChart" width="400" height="400"></canvas><div id="radarLegend" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:12px;padding:0 16px"></div></div>';

    document.getElementById('comparePanelBody').innerHTML = html;

    document.querySelectorAll('.compare-remove').forEach(btn => {
        btn.onclick = () => { toggleCompareSelection(parseInt(btn.dataset.id)); };
    });
    
    // 绘制雷达图
    drawRadarChart(selected);
}

// ===== 刷新 =====
function refresh() {
    renderBrandTags();
    renderScreenTags();
    renderCpuTags();
    renderFeatureTags();
    renderPriceRangeTags();
    renderScreenSizeTags();
    renderActiveBar();
    renderPhones();
}

// ===== 暗色模式切换 =====
function toggleDarkMode() {
    const body = document.body;
    const toggle = document.getElementById('darkModeToggle');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        toggle.textContent = '☀️';
        localStorage.setItem('darkMode', 'true');
    } else {
        toggle.textContent = '🌙';
        localStorage.setItem('darkMode', 'false');
    }
}

// ===== 雷达图绘制 =====
function drawRadarChart(phones) {
    const canvas = document.getElementById('radarChart');
    const container = document.getElementById('radarChartContainer');
    
    if (!canvas || !container || phones.length < 2) {
        if (container) container.style.display = 'none';
        return;
    }
    
    container.style.display = 'flex';
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 定义参数维度
    const dimensions = [
        { name: '性能', key: 'performance', max: 100 },
        { name: '屏幕', key: 'screen', max: 100 },
        { name: '拍照', key: 'camera', max: 100 },
        { name: '电池', key: 'battery', max: 100 },
        { name: '充电', key: 'charging', max: 100 },
        { name: '性价比', key: 'value', max: 100 }
    ];
    
    // 计算每款手机的参数分数
    const phoneScores = phones.map(phone => {
        const scores = {};
        
        // 性能分数（基于处理器）
        const processor = phone.processor || '';
        if (processor.includes('Elite') || processor.includes('天玑9500') || processor.includes('麒麟9030')) {
            scores.performance = 95;
        } else if (processor.includes('天玑9400') || processor.includes('麒麟9020') || processor.includes('A19')) {
            scores.performance = 90;
        } else if (processor.includes('8 Gen') || processor.includes('天玑8')) {
            scores.performance = 80;
        } else {
            scores.performance = 70;
        }
        
        // 屏幕分数（基于刷新率和分辨率）
        let refreshRate = phone.refresh_hz || 60;
        let hasHighRes = phone.resolution && (phone.resolution.includes('2K') || phone.resolution.includes('1440'));
        
        // 如果是折叠屏，使用展开时的参数
        if (phone.screen_unfolded) {
            refreshRate = phone.screen_unfolded.refresh_hz || 60;
            hasHighRes = phone.screen_unfolded.resolution && (phone.screen_unfolded.resolution.includes('2K') || phone.screen_unfolded.resolution.includes('1440'));
        }
        
        scores.screen = Math.min(100, (refreshRate / 144) * 60 + (hasHighRes ? 40 : 30));
        
        // 拍照分数（基于摄像头描述）
        const cameraDesc = phone.camera_desc || '';
        if (cameraDesc.includes('潜望') || cameraDesc.includes('长焦')) {
            scores.camera = 90;
        } else if (cameraDesc.includes('主摄') && cameraDesc.includes('超广角')) {
            scores.camera = 80;
        } else {
            scores.camera = 70;
        }
        
        // 电池分数（基于电池容量）
        const battery = phone.battery_mah || 4000;
        scores.battery = Math.min(100, (battery / 6000) * 100);
        
        // 充电分数（基于充电功率）
        const charging = phone.charging_w || 18;
        scores.charging = Math.min(100, (charging / 120) * 100);
        
        // 性价比分数（基于价格和配置）
        const price = phone.price || 5000;
        const overallScore = (scores.performance + scores.screen + scores.camera + scores.battery + scores.charging) / 5;
        scores.value = Math.min(100, overallScore * (5000 / Math.max(price, 1000)));
        
        return {
            name: phone.model,
            brand: phone.brand,
            scores: scores
        };
    });
    
    // 颜色配置
    const colors = [
        'rgba(99, 102, 241, 0.55)',   // indigo
        'rgba(236, 72, 153, 0.55)',   // pink
        'rgba(52, 211, 153, 0.55)',   // emerald
        'rgba(251, 146, 60, 0.55)'    // amber
    ];
    
    const borderColors = [
        'rgba(99, 102, 241, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(52, 211, 153, 1)',
        'rgba(251, 146, 60, 1)'
    ];
    
    // 绘制背景网格
    const numSides = dimensions.length;
    const angleStep = (Math.PI * 2) / numSides;
    
    // 绘制同心多边形
    for (let level = 5; level >= 1; level--) {
        const levelRadius = (radius / 5) * level;
        ctx.beginPath();
        for (let i = 0; i <= numSides; i++) {
            const angle = angleStep * i - Math.PI / 2;
            const x = centerX + levelRadius * Math.cos(angle);
            const y = centerY + levelRadius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.stroke();
    }
    
    // 绘制轴线和标签
    for (let i = 0; i < numSides; i++) {
        const angle = angleStep * i - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // 轴线
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
        ctx.stroke();
        
        // 标签
        const labelX = centerX + (radius + 25) * Math.cos(angle);
        const labelY = centerY + (radius + 25) * Math.sin(angle);
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#f1f5f9' : '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dimensions[i].name, labelX, labelY);
    }
    
    // 绘制每款手机的数据区域
    phoneScores.forEach((phoneData, index) => {
        if (index >= colors.length) return;
        
        ctx.beginPath();
        for (let i = 0; i <= numSides; i++) {
            const dimension = dimensions[i % numSides];
            const score = phoneData.scores[dimension.key] || 50;
            const normalizedScore = score / dimension.max;
            const angle = angleStep * (i % numSides) - Math.PI / 2;
            const x = centerX + radius * normalizedScore * Math.cos(angle);
            const y = centerY + radius * normalizedScore * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        ctx.strokeStyle = borderColors[index];
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // 绘制图例（HTML方式，可靠显示机型名称）
    const legendEl = document.getElementById('radarLegend');
    if (legendEl) {
        legendEl.innerHTML = phoneScores.map((pd, i) => {
            const color = colors[i % colors.length];
            const borderColor = borderColors[i % borderColors.length];
            return '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:var(--bg);border-radius:20px;font-size:.8rem;border:1px solid ' + borderColor + '">' +
                '<span style="width:10px;height:10px;border-radius:2px;background:' + color + ';display:inline-block"></span>' +
                '<span style="color:var(--text);font-weight:600">' + pd.name + '</span>' +
                '</span>';
        }).join('');
    }
}

// ===== 初始化 =====
function init() {
    renderStats();
    refresh();
    setupEventListeners();
}

// ===== 事件监听 =====
function setupEventListeners() {
    document.getElementById('sortSelect').addEventListener('change', e => {
        currentSort = e.target.value;
        updateHash();
        refresh();
    });
    // 筛选区折叠
    document.querySelectorAll('.filter-label').forEach(label => {
        label.addEventListener('click', () => {
            const section = label.parentElement;
            section.classList.toggle('collapsed');
        });
    });
    document.getElementById('clearAll').addEventListener('click', () => {
        selectedBrands.clear();
        selectedScreen = null;
        selectedCpu.clear();
        selectedTags.clear();
        selectedPriceRanges.clear();
        selectedScreenSizes.clear();
        compareList = [];
        compareMode = false;
        document.getElementById('compareModeBtn').classList.remove('active');
        document.getElementById('compareModeBtn').textContent = '📊 机型对比';
        updateHash();
        refresh();
    });

    // 对比模式按钮
    document.getElementById('compareModeBtn').addEventListener('click', toggleCompareMode);
    document.getElementById('compareBarStart').addEventListener('click', startCompare);
    document.getElementById('compareBarClear').addEventListener('click', clearCompareSelection);

    // 暗色模式切换
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // 从本地存储加载暗色模式设置
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }

    // 关闭对比面板
    document.getElementById('comparePanelClose').addEventListener('click', () => {
        document.getElementById('comparePanel').style.display = 'none';
    });
    document.getElementById('comparePanelOverlay').addEventListener('click', () => {
        document.getElementById('comparePanel').style.display = 'none';
    });

    // 对比选择栏关闭按钮
    document.getElementById('compareBarClose').addEventListener('click', () => {
        compareList = [];
        compareMode = false;
        document.getElementById('compareModeBtn').classList.remove('active');
        document.getElementById('compareModeBtn').textContent = '📊 机型对比';
        updateCompareBar();
        document.getElementById('comparePanel').style.display = 'none';
        refresh();
    });

    // 键盘快捷键
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (compareList.length > 0) {
                compareList = [];
                updateCompareBar();
                document.getElementById('comparePanel').style.display = 'none';
                refresh();
            }
        }
    });

    // 回到顶部
    const backTop = document.getElementById('backTop');
    if (backTop) {
        window.addEventListener('scroll', () => {
            backTop.style.display = window.scrollY > 500 ? '' : 'none';
        }, { passive: true });
        backTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// 启动
loadData();