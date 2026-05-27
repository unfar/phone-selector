1|// ============================================
2|// 📱 智能手机选购助手 — 核心逻辑
3|// ============================================
4|
5|let phones = [];
6|let brandList = [];
7|let selectedBrands = new Set();
8|let selectedScreen = null;
9|let selectedCpu = new Set();
10|let selectedTags = new Set();
11|let selectedPriceRanges = new Set();
12|let selectedScreenSizes = new Set();
13|let currentSort = 'newest';
14|let expandedCards = new Set();
15|
16|// ===== 对比功能变量 =====
17|let compareMode = false;
18|let compareList = [];
19|
20|// ===== 配置 =====
21|const cpuTags = ["骁龙8 Elite 5","骁龙8 Elite 1","骁龙8 Gen5","天玑9500","天玑9500s","天玑8550","天玑8550 Elite","第四代骁龙7","麒麟9030Pro","麒麟9030","麒麟9020","天玑9400","麒麟9010s","A19","A18"];
22|
23|// Brand logo data URIs (base64 SVG)
24|const brandLogos = {
25|  'Apple': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5BcHBsZTwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyLjE1MiA2Ljg5NmMtLjk0OCAwLTIuNDE1LTEuMDc4LTMuOTYtMS4wNC0yLjA0LjAyNy0zLjkxIDEuMTgzLTQuOTYxIDMuMDE0LTIuMTE3IDMuNjc1LS41NDYgOS4xMDMgMS41MTkgMTIuMDkgMS4wMTMgMS40NTQgMi4yMDggMy4wOSAzLjc5MiAzLjAzOSAxLjUyLS4wNjUgMi4wOS0uOTg3IDMuOTM1LS45ODcgMS44MzEgMCAyLjM1Ljk4NyAzLjk2Ljk0OCAxLjYzNy0uMDI2IDIuNjc2LTEuNDggMy42NzYtMi45NDggMS4xNTYtMS42ODggMS42MzYtMy4zMjUgMS42NjItMy40MTUtLjAzOS0uMDEzLTMuMTgyLTEuMjIxLTMuMjItNC44NTctLjAyNi0zLjA0IDIuNDgtNC40OTQgMi41OTctNC41NTktMS40MjktMi4wOS0zLjYyMy0yLjMyNC00LjM5LTIuMzc2LTItLjE1Ni0zLjY3NSAxLjA5LTQuNjEgMS4wOXpNMTUuNTMgMy44M2MuODQzLTEuMDEyIDEuNC0yLjQyNyAxLjI0NS0zLjgzLTEuMjA3LjA1Mi0yLjY2Mi44MDUtMy41MzIgMS44MTgtLjc4Ljg5Ni0xLjQ1NCAyLjMzOC0xLjI3MyAzLjcxNCAxLjMzOC4xMDQgMi43MTUtLjY4OCAzLjU1OS0xLjcwMSIvPjwvc3ZnPg==',
26|  'HONOR': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5Ib25vcjwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIuNjAxIDkuNzUzdjEuODIzSC44MDdWOS43NTNIMHY0LjQ5OGguODA3di0xLjg3NGgxLjc5NHYxLjg3NGguODA3VjkuNzUzaC0uODA3Wm0xOC42NzEuODAxaC44OThjLjM2OSAwIC42NjcuMjk3LjY2Ny42NjJhLjY2NS42NjUgMCAwIDEtLjY2Ny42NjNoLS44OTh2LTEuMzI1Wm0tLjgwNi0uODAxdjQuNDk4aC44MDZ2LTIuMDAybDEuNjggMi4wMDJIMjRsLTEuMzc2LTEuNjRhMS40NjIgMS40NjIgMCAwIDAtLjQ0NC0yLjg1OGgtMS43MTYuMDAyWm0tNy42My0uMDE0djIuODA3bC0xLjk1OS0yLjgwN2gtLjY0NHY0LjQ5OGguODA3di0yLjgybDEuOTY4IDIuODJoLjYzM1Y5LjczOWgtLjgwNVptLTcuNTMyIDIuMjZjMC0uODMyLjY4LTEuNTA2IDEuNTE3LTEuNTA2QTEuNTEgMS41MSAwIDAgMSA4LjMzNyAxMmMwIC44MzItLjY3OSAxLjUwNi0xLjUxNiAxLjUwNi0uNDAzIDAtLjc4OS0uMTU5LTEuMDczLS40NDFBMS41MDQgMS41MDQgMCAwIDEgNS4zMDQgMTJ2LS4wMDFaTTQuNDk3IDEyYzAgLjkzMy41NjYgMS43NzQgMS40MzQgMi4xMzIuODY5LjM1NyAxLjg2OC4xNiAyLjUzMy0uNS42NjQtLjY2Ljg2My0xLjY1My41MDMtMi41MTVhMi4zMjQgMi4zMjQgMCAwIDAtMi4xNDYtMS40MjUgMi4zMTYgMi4zMTYgMCAwIDAtMi4zMjMgMi4zMDdMNC40OTcgMTJabTExLjA0LS4wMDFhMS41MTMgMS41MTMgMCAwIDEgMS41MTgtMS41MDZjLjgzOCAwIDEuNTE2LjY3NSAxLjUxNiAxLjUwN2ExLjUxMyAxLjUxMyAwIDAgMS0xLjUxOCAxLjUwNmMtLjQwMiAwLS43ODgtLjE1OS0xLjA3Mi0uNDQxYTEuNSAxLjUgMCAwIDEtLjQ0NC0xLjA2NlpNMTQuNzMgMTJjMCAuOTMzLjU2NiAxLjc3NCAxLjQzNCAyLjEzMi44NjguMzU3IDEuODY4LjE2IDIuNTMyLS41LjY2NS0uNjYuODY0LTEuNjUzLjUwNC0yLjUxNWEyLjMyNSAyLjMyNSAwIDAgMC0yLjE0Ny0xLjQyNSAyLjMxNiAyLjMxNiAwIDAgMC0yLjMyMyAyLjMwN1YxMloiLz48L3N2Zz4K',
27|  'Huawei': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5IdWF3ZWk8L3RpdGxlPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zLjY3IDYuMTRTMS44MiA3LjkxIDEuNzIgOS43OHYuMzVjLjA4IDEuNTEgMS4yMiAyLjQgMS4yMiAyLjQgMS44MyAxLjc5IDYuMjYgNC4wNCA3LjMgNC41NSAwIDAgLjA2LjAzLjEtLjAxbC4wMi0uMDR2LS4wNEM3LjUyIDEwLjggMy42NyA2LjE0IDMuNjcgNi4xNHpNOS42NSAxOC42Yy0uMDItLjA4LS4xLS4wOC0uMS0uMDhsLTcuMzguMjZjLjggMS40MyAyLjE1IDIuNTMgMy41NiAyLjIuOTYtLjI1IDMuMTYtMS43OCAzLjg4LTIuMy4wNi0uMDUuMDQtLjA5LjA0LS4wOXptLjA4LS43OEM2LjQ5IDE1LjYzLjIxIDEyLjI4LjIxIDEyLjI4Yy0uMTUuNDYtLjIuOS0uMjEgMS4zdi4wN2MwIDEuMDcuNCAxLjgyLjQgMS44Mi44IDEuNjkgMi4zNCAyLjIgMi4zNCAyLjIuNy4zIDEuNC4zMSAxLjQuMzEuMTIuMDIgNC40IDAgNS41NCAwIC4wNSAwIC4wOC0uMDUuMDgtLjA1di0uMDZjMC0uMDMtLjAzLS4wNS0uMDMtLjA1ek05LjA2IDMuMTlhMy40MiAzLjQyIDAgMDAtMi41NyAzLjE1di40MWMuMDMuNi4xNiAxLjA1LjE2IDEuMDUuNjYgMi45IDMuODYgNy42NSA0LjU1IDguNjUuMDUuMDUuMS4wMy4xLjAzYS4xLjEgMCAwMC4wNi0uMWMxLjA2LTEwLjYtMS4xMS0xMy40Mi0xLjExLTEzLjQyLS4zMi4wMi0xLjE5LjIzLTEuMTkuMjN6bTguMjk5IDIuMjdzLS40OS0xLjgtMi40NC0yLjI4YzAgMC0uNTctLjE0LTEuMTctLjIyIDAgMC0yLjE4IDIuODEtMS4xMiAxMy40My4wMS4wNy4wNi4wOC4wNi4wOC4wNy4wMy4xLS4wMy4xLS4wMy43Mi0xLjAzIDMuOS01Ljc2IDQuNTUtOC42NCAwIDAgLjM2LTEuNC4wMi0yLjM0em0tMi45MiAxMy4wN3MtLjA3IDAtLjA5LjA1YzAgMC0uMDEuMDcuMDMuMS43LjUxIDIuODUgMiAzLjg4IDIuMyAwIDAgLjE2LjA1LjQzLjA2aC4xNGMuNjktLjAyIDEuOS0uMzcgMy0yLjI2bC03LjQtLjI1em03LjgzLTguNDFjLjE0LTIuMDYtMS45NC0zLjk3LTEuOTQtMy45OCAwIDAtMy44NSA0LjY2LTYuNjcgMTAuOCAwIDAtLjAzLjA4LjAyLjEzbC4wNC4wMWguMDZjMS4wNi0uNTMgNS40Ni0yLjc3IDcuMjgtNC41NCAwIDAgMS4xNS0uOTMgMS4yMS0yLjQyem0xLjUyIDIuMTRzLTYuMjggMy4zNy05LjUyIDUuNTVjMCAwLS4wNS4wNC0uMDMuMTEgMCAwIC4wMy4wNi4wNy4wNiAxLjE2IDAgNS41NiAwIDUuNjctLjAyIDAgMCAuNTctLjAyIDEuMjctLjI5IDAgMCAxLjU2LS41IDIuMzctMi4yNyAwIDAgLjczLTEuNDUuMTctMy4xNHoiLz48L3N2Zz4=',
28|  'Lenovo': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5MZW5vdm88L3RpdGxlPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMS4wNDQgMTIuMjg4YzAgLjUtLjM0My44NjctLjgxNS44NjctLjQ2NCAwLS44MjctLjM4LS44MjctLjg2NyAwLS41MS4zNDMtLjg2OC44MTUtLjg2OC40NjQgMCAuODI3LjM4MS44MjcuODY4em0tMTQuMzA1LS45MmEuNzg3Ljc4NyAwIDAgMC0uNjUxLjMwNy45OTEuOTkxIDAgMCAwLS4xNzIuNzM4bDEuNDc5LS42MTRhLjcwOC43MDggMCAwIDAtLjY1Ni0uNDN6bTYuOTYzLjA1MmMtLjQ3MiAwLS44MTYuMzU4LS44MTYuODY4IDAgLjQ4Ni4zNjQuODY3LjgyOC44NjcuNDcyIDAgLjgxNS0uMzY4LjgxNS0uODY3IDAtLjQ4Ny0uMzYzLS44NjgtLjgyNy0uODY4ek0yNCA3Ljk5N3Y4LjAwNkgwVjcuOTk3aDI0ek01LjAxIDEzLjA1SDMuMDg4VjkuODI1SDIuMjN2NC4wMDNoMi43OHYtLjc3N3ptMS4xMzctLjA5NGwyLjE2My0uODk3YTEuNjY3IDEuNjY3IDAgMCAwLS4zNy0uODZjLS4yODQtLjMzLS43MDQtLjUwNS0xLjIxNi0uNTA1LS45MzEgMC0xLjYzMy42ODYtMS42MzMgMS41OTMgMCAuOTMuNzA0IDEuNTkzIDEuNzI2IDEuNTkzLjU3MiAwIDEuMTU4LS4yNzIgMS40MzItLjU4OWwtLjUzNS0uNDExYy0uMzU3LjI2NC0uNTYuMzI2LS44ODUuMzI2LS4yOTIgMC0uNTItLjA5LS42ODItLjI1em01LjU3LTEuMDM5YzAtLjcwOS0uNTA3LTEuMjIzLTEuMjUyLTEuMjIzYTEuMjggMS4yOCAwIDAgMC0xLjAwNS40OTR2LS40NDJoLS44NDZ2My4wODFoLjg0NnYtMS43NTNjMC0uMzE2LjI0NS0uNjUxLjY5OC0uNjUxLjM1IDAgLjcxMi4yNDMuNzEyLjY1MXYxLjc1M2guODQ3di0xLjkxem0zLjY0Ny4zN2MwLS45MDQtLjcyNS0xLjU5My0xLjY1LTEuNTkzLS45MzMgMC0xLjY2My43LTEuNjYzIDEuNTkzIDAgLjkwMy43MjYgMS41OTIgMS42NTEgMS41OTIuOTMyIDAgMS42NjItLjcgMS42NjItMS41OTJ6bTIuMDY2IDEuNTRsMS4yNjgtMy4wODFoLS45NjdsLS43NjUgMi4wOTktLjc2NS0yLjFoLS45NjZsMS4yNjggMy4wODFoLjkyN3ptNC40NDktMS41NGMwLS45MDQtLjcyNS0xLjU5My0xLjY1LTEuNTkzLS45MzIgMC0xLjY2Mi43LTEuNjYyIDEuNTkzIDAgLjkwMy43MjUgMS41OTIgMS42NSAxLjU5Mi45MzIgMCAxLjY2Mi0uNyAxLjY2Mi0xLjU5MnoiLz48L3N2Zz4=',
29|  'Motorola': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5Nb3Rvcm9sYTwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJDMjQuMDAyIDUuMzc1IDE4LjYzMi4wMDIgMTIuMDA3IDBIMTJ6bTcuMzI3IDE4LjA2NXMtLjU4MS0yLjYyNy0xLjUyOC00LjE5N2MtLjUxNC0uODU3LTEuMzA4LTEuNTUzLTIuMzY4LTEuNTMyLS43NDUgMC0xLjM5OS40MjMtMi4yIDEuNTUzLS40NjkuNzctLjg4MiAxLjU3My0xLjIzNSAyLjQwMyAwIDAtLjI5LS42NzUtLjYzLTEuMzQzYTguMDM4IDguMDM4IDAgMCAwLS42MDUtMS4wNDljLS44MDQtMS4xMy0xLjQ1NS0xLjUzOS0yLjItMS41NTMtMS4wNDktLjAyMS0xLjg1NC42NzUtMi4zNjQgMS41MjgtLjk0OCAxLjU3NC0xLjUyOCA0LjE5Ny0xLjUyOCA0LjE5N2gtLjg2NGw0LjYwNi0xNS4xMiAzLjU2IDExLjgwNC4wMjQuMDIxLjAyNC0uMDIxIDMuNTYtMTEuODA0IDQuNjEgMTUuMTEzaC0uODYyeiIvPjwvc3ZnPg==',
30|  'OPPO': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5PUFBPPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMi44NSAxMi43ODZoLS4wMDFDMS42MzkgMTIuNzc0Ljg1OCAxMi4yLjg1OCAxMS4zMjFzLjc4MS0xLjQ1MiAxLjk5LTEuNDY1YzEuMjEuMDEzIDEuOTkyLjU4OCAxLjk5MiAxLjQ2NXMtLjc4MiAxLjQ1My0xLjk5IDEuNDY1em0uMDM0LTMuNjM4aC0uMDczQzEuMTU2IDkuMTc1IDAgMTAuMDY4IDAgMTEuMzJzMS4xNTYgMi4xNDcgMi44MTEgMi4xNzRoLjA3M2MxLjY1NS0uMDI3IDIuODExLS45MjEgMi44MTEtMi4xNzRTNC41NCA5LjE3NSAyLjg4NSA5LjE0OHptMTguMjcgMy42MzhjLTEuMjEtLjAxMi0xLjk5Mi0uNTg3LTEuOTkyLTEuNDY1cy43ODItMS40NTIgMS45OTEtMS40NjVjMS4yMS4wMTMgMS45OTEuNTg4IDEuOTkxIDEuNDY1cy0uNzgxIDEuNDUzLTEuOTkgMS40NjV6bS4wMzUtMy42MzhoLS4wNzNjLTEuNjU1LjAyNy0yLjgxMS45Mi0yLjgxMSAyLjE3M3MxLjE1NiAyLjE0NyAyLjgxIDIuMTc0aC4wNzRDMjIuODQ0IDEzLjQ2OCAyNCAxMi41NzQgMjQgMTEuMzJzLTEuMTU2LTIuMTQ2LTIuODExLTIuMTczem0tNi4xMjYgMy42MzhjLTEuMjEtLjAxMi0xLjk5LS41ODctMS45OS0xLjQ2NXMuNzgtMS40NTIgMS45OS0xLjQ2NWMxLjIxLjAxMyAxLjk5MS41ODggMS45OTEgMS40NjVzLS43ODEgMS40NTMtMS45OSAxLjQ2NXptLjAzNi0zLjYzOGgtLjA3M2MtLjc4OS4wMTMtMS40NjQuMjIyLTEuOTU1LjU3NHYtLjM3aC0uODU3djUuNWguODU3di0xLjkzMWMuNDkuMzUxIDEuMTY2LjU2IDEuOTU0LjU3NGguMDc0YzEuNjU1LS4wMjcgMi44MS0uOTIxIDIuODEtMi4xNzRzLTEuMTU1LTIuMTQ2LTIuODEtMi4xNzN6bS02LjE0NCAzLjYzOGMtMS4yMS0uMDEyLTEuOTktLjU4Ny0xLjk5LTEuNDY1cy43OC0xLjQ1MiAxLjk5LTEuNDY1YzEuMjEuMDEzIDEuOTkxLjU4OCAxLjk5MSAxLjQ2NXMtLjc4MSAxLjQ1My0xLjk5IDEuNDY1em0uMDM3LTMuNjM4SDguOTJjLS43ODkuMDEzLTEuNDY0LjIyMi0xLjk1NS41NzR2LS4zN2gtLjg1NnY1LjVoLjg1NnYtMS45MzFjLjQ5MS4zNTEgMS4xNjYuNTYgMS45NTUuNTc0YTMuNzI4IDMuNzI4IDAgMCAwIC4wNzMgMGMxLjY1NS0uMDI3IDIuODExLS45MjEgMi44MTEtMi4xNzRzLTEuMTU2LTIuMTQ2LTIuODEtMi4xNzN6Ii8+PC9zdmc+',
31|  'OnePlus': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5PbmVQbHVzPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAzLjc0VjI0aDIwLjI2VjEyLjQyOGgtMi4yNTZ2OS4zMTdIMi4yNTRWNS45OTVoOS4zMThWMy43NDJ6TTE4LjAwNCAwdjMuNzRoLTMuNzU4djIuMjU2aDMuNzU4djMuNzU4aDIuMjU1VjUuOTk2SDI0VjMuNzRoLTMuNzU4VjB6bS02LjQ1IDE4Ljc1NlY4Ljg2Mkg5LjU2MmMwIC42ODItLjIyOCAxLjE4OS0uNTc3IDEuNTA0LS4zNjcuMjk3LS45MS40MzctMS41NTYuNDM3aC0uMjQ1djEuNjI1aDIuMTMzdjYuMzFoMi4yMzd6Ii8+PC9zdmc+',
32|  'REDMI': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDYwIDI0Ij48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz48dGV4dCB4PSIzMCIgeT0iMTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjEzIiBmaWxsPSIjZmZmIiBsZXR0ZXItc3BhY2luZz0iMyI+UkVETUk8L3RleHQ+PC9zdmc+',
33|  'RedMagic': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NiIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDY2IDI0Ij48cmVjdCB3aWR0aD0iNjYiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNiA2bDQtMiA0IDIgNCA2LTQgNi00IDItNC0yLTQtNiA0LTZ6IiBvcGFjaXR5PSIwLjg1Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTggOGwyLTEgMiAxIDIgNC0yIDQtMiAxLTItMS0yLTQgMi00eiIvPjx0ZXh0IHg9IjIyIiB5PSIxOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI4MDAiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiNmZmYiIGxldHRlci1zcGFjaW5nPSIxIj5SRURNQUdJQzwvdGV4dD48L3N2Zz4=',
34|  'Samsung': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5TYW1zdW5nPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTkuODE2NiAxMC4yODA4bC4wNDU5IDIuNjkzNGgtLjAyM2wtLjc3OTMtMi42OTM0aC0xLjI4Mzd2My4zOTI1aC44NDgxbC0uMDQ1OC0yLjc4NWguMDIzbC44MzY2IDIuNzg1aDEuMjI2NHYtMy4zOTI1em0tMTYuMTQ5IDBsLS42NDE4IDMuNDI3aC45Mjg0bC40Njk5LTMuMTE3NWguMDIyOWwuNDU4NSAzLjExNzRoLjkxNjlsLS42MzA0LTMuNDI2OXptNS4xODA1IDBsLS40MjQgMi42MTMyaC0uMDIzbC0uNDI0LTIuNjEzMkg2LjU3ODhsLS4wNjg4IDMuNDI3aC44NTk2bC4wMjMtMy4wODMyaC4wMTE0bC41NzMgMy4wODMxaC44NzExbC41NzMxLTMuMDgzaC4wMjNsLjAyMjggMy4wODNoLjg1OTZsLS4wODAyLTMuNDI2OXptLTcuMjY2NCAyLjQ1MjdjLjAzNDMuMDgwMi4wMjI5LjE5NDkuMDExNC4yNTIyLS4wMjI5LjExNDYtLjEwMzEuMjI5Mi0uMzMyNC4yMjkyLS4yMTc3IDAtLjM0MzgtLjEyNi0uMzQzOC0uMzA5NXYtLjMzMjNIMHYuMjYzNmMwIC43Njc5LjYwNzQuOTk3MSAxLjI0OTMuOTk3MS42MTg5IDAgMS4xMzQ2LS4yMTc4IDEuMjE0OS0uNzc5NC4wNDU4LS4yOTguMDExNC0uNDkyOCAwLS41NjE2LS4xNjA1LS43MjItMS40NjctLjkyODMtMS41NTg4LTEuMzI5NS0uMDExNC0uMDY4OC0uMDExNC0uMTM3NSAwLS4xODM0LjAyMy0uMTE0Ni4xMDMyLS4yMjkyLjMwOTUtLjIyOTIuMjA2MyAwIC4zMjEuMTI2LjMyMS4zMDk1di4yMDYzaC44NTk1di0uMjQwN2MwLS43NDUtLjY3NjItLjg1OTYtMS4xNTc2LS44NTk2LS42MDc0IDAtMS4xMTE3LjIwNjMtMS4yMDM0Ljc1NjQtLjAyMy4xNDktLjAzNDQuMjg2Ni4wMTE0LjQ1ODUuMTM3Ni43MTA2IDEuMzY0LjkxNjkgMS41MzU4IDEuMzUyNG0xMS4xNTIgMGMuMDM0My4wODAzLjAyMjguMTgzNC4wMTE0LjI1MjItLjAyMy4xMTQ2LS4xMDMyLjIyOTItLjMzMjQuMjI5Mi0uMjE3OCAwLS4zNDM4LS4xMjYtLjM0MzgtLjMwOTV2LS4zMzIzaC0uOTE3di4yNjM2YzAgLjc1NjQuNTk2Ljk4NTcgMS4yMzc5Ljk4NTcuNjE4OSAwIDEuMTIzMi0uMjA2MyAxLjIwMzQtLjc3OTQuMDQ1OS0uMjk4LjAxMTUtLjQ4MTQgMC0uNTYxNi0uMTM3NS0uNzEwNi0xLjQzMjctLjkyODQtMS41MjQzLTEuMzE4LS4wMTE1LS4wNjg4LS4wMTE1LS4xMzc2IDAtLjE4MzUuMDIyOS0uMTE0Ni4xMDMxLS4yMjkyLjMwOTQtLjIyOTIuMTk0OCAwIC4zMjEuMTI2LjMyMS4zMDk1di4yMDYzaC44NDh2LS4yNDA3YzAtLjc0NS0uNjY0Ny0uODU5Ni0xLjE0Ni0uODU5Ni0uNjA3NSAwLTEuMTAwNC4xOTQ4LTEuMTkyLjc1NjQtLjAyMy4xNDktLjAyMy4yODY2LjAxMTQuNDU4NS4xMzc2LjcxMDYgMS4zNDEuOTA1NCAxLjUxMyAxLjM1MjRtMi44ODgyLjQ1ODVjLjI0MDcgMCAuMzA5NC0uMTYwNS4zMzIzLS4yNTIyLjAxMTUtLjAzNDMuMDExNS0uMDkxNy4wMTE1LS4xMjZ2LTIuNTMzaC44NzF2Mi40NjQyYzAgLjA2ODggMCAuMTk0OC0uMDExNC4yMjkyLS4wNTczLjY0MTktLjU2MTYuODQ4Mi0xLjE5Mi44NDgyLS42MzAzIDAtMS4xMzQ2LS4yMDYzLTEuMTkyLS44NDgyIDAtLjAzNDQtLjAxMTQtLjE2MDQtLjAxMTQtLjIyOTJ2LTIuNDY0MmguODcxdjIuNTMzYzAgLjA0NTggMCAuMDkxNi4wMTE1LjEyNiAwIC4wOTE3LjA2ODguMjUyMi4zMDk1LjI1MjJtNy4xNTE4LS4wMzQ0Yy4yNTIyIDAgLjMzMjQtLjE2MDUuMzU1My0uMjUyMi4wMTE1LS4wMzQzLjAxMTUtLjA5MTcuMDExNS0uMTI2di0uNDkyOWgtLjM1NTN2LS41MDQzSDI0di45MTdjMCAuMDY4NyAwIC4xMTQ1LS4wMTE1LjIyOTItLjA1NzMuNjMwMy0uNTk2Ljg0ODEtMS4yMDM0Ljg0ODEtLjYwNzUgMC0xLjE0NjEtLjIxNzgtMS4yMDM0LS44NDgxLS4wMTE1LS4xMTQ3LS4wMTE1LS4xNjA1LS4wMTE1LS4yMjkzdi0xLjQ0NGMwLS4wNTc0LjAxMTUtLjE3Mi4wMTE1LS4yMjkzLjA4MDItLjY0MTkuNTk2LS44NDgyIDEuMjAzNC0uODQ4MnMxLjEzNDcuMjA2MyAxLjIwMzQuODQ4MmMuMDExNS4xMDMxLjAxMTUuMjI5Mi4wMTE1LjIyOTJ2LjExNDZoLS44NTk2di0uMTk0OHMwLS4wODAzLS4wMTE1LS4xMjYxYy0uMDExNC0uMDgwMi0uMDgwMi0uMjUyMS0uMzQzOC0uMjUyMS0uMjUyMSAwLS4zMjEuMTYwNC0uMzQzOC4yNTIxLS4wMTE1LjA0NTgtLjAxMTUuMTAzMi0uMDExNS4xNjA1djEuNTcwMmMwIC4wNDU4IDAgLjA5MTYuMDExNS4xMjYgMCAuMDkxNy4wOTE3LjI1MjIuMzMyMy4yNTIyIi8+PC9zdmc+',
35|  'Xiaomi': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5YaWFvbWk8L3RpdGxlPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xMiAwQzguMDE2IDAgNC43NTYuMjU1IDIuNDkzIDIuNTE2LjIzIDQuNzc2IDAgOC4wMzMgMCAxMi4wMTJjMCAzLjk4LjIzIDcuMjM1IDIuNDk0IDkuNDk3QzQuNzU3IDIzLjc3IDguMDE3IDI0IDEyIDI0YzMuOTgzIDAgNy4yNDMtLjIzIDkuNTA2LTIuNDkxQzIzLjc3IDE5LjI0NyAyNCAxNS45OSAyNCAxMi4wMTJjMC0zLjk4NC0uMjMzLTcuMjQzLTIuNTAyLTkuNTA0QzE5LjIzNC4yNTIgMTUuOTc4IDAgMTIgMHpNNC45MDYgNy40MDVoNS42MjRjMS40NyAwIDMuMDA3LjA2OCAzLjc2NC44MjcuNzQ2Ljc0Ni44MjcgMi4yMzMuODMgMy42NzZ2NC41NGEuMTUuMTUgMCAwIDEtLjE1Mi4xNDdoLTEuOTQ3YS4xNS4xNSAwIDAgMS0uMTUyLS4xNDhWMTEuODNjLS4wMDItLjgwNi0uMDQ4LTEuNjM0LS40NjQtMi4wNTEtLjM1OC0uMzYtMS4wMjYtLjQ0MS0xLjcyLS40NThINy4xNThhLjE1LjE1IDAgMCAwLS4xNTEuMTQ3djYuOThhLjE1LjE1IDAgMCAxLS4xNTIuMTQ4SDQuOTA2YS4xNS4xNSAwIDAgMS0uMTUtLjE0OFY3LjU1NGEuMTUuMTUgMCAwIDEgLjE1LS4xNDl6bTEyLjEzMSAwaDEuOTQ5YS4xNS4xNSAwIDAgMSAuMTUuMTV2OC44OTJhLjE1LjE1IDAgMCAxLS4xNS4xNDhoLTEuOTQ5YS4xNS4xNSAwIDAgMS0uMTUxLS4xNDhWNy41NTRhLjE1LjE1IDAgMCAxIC4xNTEtLjE0OXpNOC45MiAxMC45NDhoMi4wNDZjLjA4MyAwIC4xNS4wNjYuMTUuMTQ3djUuMzUyYS4xNS4xNSAwIDAgMS0uMTUuMTQ4SDguOTJhLjE1LjE1IDAgMCAxLS4xNTItLjE0OHYtNS4zNTJhLjE1LjE1IDAgMCAxIC4xNTItLjE0N1oiLz48L3N2Zz4=',
36|  'iQOO': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1OCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDU4IDI0Ij48cmVjdCB3aWR0aD0iNTgiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz48dGV4dCB4PSIyOSIgeT0iMTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjE4IiBmaWxsPSIjZmZmIiBsZXR0ZXItc3BhY2luZz0iMiI+aVFPTzwvdGV4dD48L3N2Zz4=',
37|  'realme': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDU2IDI0Ij48cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz48dGV4dCB4PSIyOCIgeT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjEzIiBmaWxsPSIjZmZmIiBsZXR0ZXItc3BhY2luZz0iMSI+cmVhbG1lPC90ZXh0Pjwvc3ZnPg==',
38|  'vivo': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT52aXZvPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTkuNjA0IDE0LjEwMWMtMS4xNTkgMC0xLjI2Mi0uOTUtMS4yNjItMS4yNCAwLS4yOS4xMDMtMS4yNDIgMS4yNjItMS4yNDJoMi4wNjJjMS4xNiAwIDEuMjYzLjk1MSAxLjI2MyAxLjI0MiAwIC4yOS0uMTA0IDEuMjQtMS4yNjMgMS4yNG0tMi4wNjItMy41MjdjLTIuMTQyIDAtMi4zMzMgMS43NTItMi4zMzMgMi4yODcgMCAuNTM1LjE5IDIuMjg2IDIuMzMzIDIuMjg2aDIuMDYyYzIuMTQzIDAgMi4zMzQtMS43NTEgMi4zMzQtMi4yODYgMC0uNTM1LS4xOS0yLjI4Ny0yLjMzNC0yLjI4N20tNS40NzcuMTA3Yy0uMjg2IDAtLjM0NS4wNS0uNDU2LjIxMy0uMTEuMTY0LTIuMDIyIDMuMDgyLTIuMDIyIDMuMDgyLS4wNi4wOS0uMTI2LjEyNi0uMjA2LjEyNi0uMDggMC0uMTQ1LS4wMzYtLjIwNi0uMTI2IDAgMC0xLjkxMi0yLjkxOC0yLjAyMi0zLjA4Mi0uMTEtLjE2NC0uMTctLjIxMy0uNDU2LS4yMTNoLS42NjhjLS4xNTQgMC0uMjI0LjEyLS4xMjcuMjY3bDIuMjgzIDMuNDY3Yy4zNTQuNTIxLjYxNC43MzIgMS4xOTYuNzMycy44NDItLjIxIDEuMTk2LS43MzJsMi4yODQtMy40NjdjLjA5Ni0uMTQ2LjAyNi0uMjY3LS4xMjgtLjI2N20tOC44NzYuMjg0YzAtLjIwMy4wOC0uMjg0LjI4My0uMjg0aC41MDVjLjIwMyAwIC4yODMuMDguMjgzLjI4M3YzLjljMCAuMjAyLS4wOC4yODMtLjI4My4yODNoLS41MDVjLS4yMDMgMC0uMjgzLS4wOC0uMjgzLS4yODN6bS0xLjc2OS0uMjg1Yy0uMjg3IDAtLjM0Ni4wNS0uNDU2LjIxMy0uMTEuMTY0LTIuMDIyIDMuMDgyLTIuMDIyIDMuMDgyLS4wNjEuMDktLjEyNi4xMjYtLjIwNi4xMjYtLjA4IDAtLjE0NS0uMDM2LS4yMDYtLjEyNiAwIDAtMS45MTItMi45MTgtMi4wMjMtMy4wODItLjExLS4xNjQtLjE2OS0uMjEzLS40NTUtLjIxM0guMTc1Yy0uMTcxIDAtLjIyNC4xMi0uMTI3LjI2N2wyLjI4MyAzLjQ2N2MuMzU1LjUyMS42MTUuNzMyIDEuMTk3LjczMi41ODIgMCAuODQyLS4yMSAxLjE5Ni0uNzMybDIuMjgzLTMuNDY3Yy4wOTctLjE0Ni4wNDQtLjI2Ny0uMTI3LS4yNjdtMS4wNTUtLjg5M2MtLjE2NS0uMTY0LS4xNjUtLjI5NSAwLS40NmwuMzUxLS4zNTFjLjE2NS0uMTY1LjI5Ni0uMTY1LjQ2IDBsLjM1Mi4zNTFjLjE2NS4xNjUuMTY1LjI5NiAwIC40NmwtLjM1Mi4zNTJjLS4xNjQuMTY1LS4yOTUuMTY1LS40NiAweiIvPjwvc3ZnPg==',
39|};
40|const featureTags = ["潜望长焦","6500mAh+","≤200g","防水","NFC","红外","USB3.0","无线充电","散热风扇"];
41|const tagDisplayNames = {"6500mAh+":"6500mAh+","≤200g":"≤200g"};
42|const priceRanges = [
43|    { name: "<1k", min: 0, max: 999 },
44|    { name: "1-2k", min: 1000, max: 1999 },
45|    { name: "2-3k", min: 2000, max: 2999 },
46|    { name: "3-4k", min: 3000, max: 3999 },
47|    { name: "4-5k", min: 4000, max: 4999 },
48|    { name: "5-6k", min: 5000, max: 5999 },
49|    { name: "6-7k", min: 6000, max: 6999 },
50|    { name: "7-8k", min: 7000, max: 7999 },
51|    { name: "8-9k", min: 8000, max: 8999 },
52|    { name: "9-10k", min: 9000, max: 9999 },
53|    { name: ">1w", min: 10000, max: 999999 }
54|];
55|const screenSizeRanges = [
56|    { name: "6英寸左右", min: 5.7, max: 6.3 },
57|    { name: "6.5英寸左右", min: 6.2, max: 6.8 },
58|    { name: "7英寸左右", min: 6.7, max: 7.5 }
59|];
60|const screenTypes = ['📱 直屏','🔄 折叠屏'];
61|const brandEnglishMap = {
62|    "苹果": "Apple",
63|    "三星": "Samsung",
64|    "摩托罗拉": "Motorola"
65|};
66|function getEnglishBrand(zh) { return brandEnglishMap[zh] || zh; }
67|
68|
69|// ===== 数据加载 =====
70|async function loadData() {
71|    try {
72|        showLoading();
73|        const resp = await fetch('data/phones.json');
74|        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
75|        phones = await resp.json();
76|        // 初始化品牌列表，确保后续渲染时有数据
77|        brandList = [...new Set(phones.map(p => p.brand))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
78|        hideLoading();
79|        restoreStateFromHash();
80|        init();
81|    } catch (err) {
82|        hideLoading();
83|        document.getElementById('phoneGrid').innerHTML =
84|            `<div class="error-msg"><div class="emoji">😢</div><p>数据加载失败：${err.message}</p><p style="margin-top:8px;font-size:.85rem">请检查网络连接或刷新页面重试</p></div>`;
85|    }
86|}
87|
88|function showLoading() {
89|    const grid = document.getElementById('phoneGrid');
90|    grid.innerHTML = '<div class="loading"><div class="spinner">⏳</div><p>加载数据中...</p></div>';
91|}
92|
93|function hideLoading() {
94|    const grid = document.getElementById('phoneGrid');
95|    grid.innerHTML = grid.innerHTML.replace('<div class="loading"><div class="spinner">⏳</div><p>加载数据中...</p></div>', '');
96|}
97|
98|// ===== URL Hash 状态管理 =====
99|function updateHash() {
100|    const params = new URLSearchParams();
101|    if (selectedBrands.size > 0) params.set('brands', [...selectedBrands].join(','));
102|    if (selectedScreen) params.set('screen', selectedScreen);
103|    if (selectedCpu.size > 0) params.set('cpu', [...selectedCpu].join(','));
104|    if (selectedTags.size > 0) params.set('tags', [...selectedTags].join(','));
105|    if (selectedPriceRanges.size > 0) params.set('priceRange', [...selectedPriceRanges].join(','));
106|    if (selectedScreenSizes.size > 0) params.set('screenSize', [...selectedScreenSizes].join(','));
107|    if (currentSort !== 'newest') params.set('sort', currentSort);
108|    const hash = params.toString();
109|    history.replaceState(null, '', `#${hash}`);
110|}
111|
112|function restoreStateFromHash() {
113|    const hash = location.hash.slice(1);
114|    if (!hash) return;
115|    const params = new URLSearchParams(hash);
116|    const brands = params.get('brands');
117|    if (brands) brands.split(',').forEach(b => selectedBrands.add(b));
118|    selectedScreen = params.get('screen') || null;
119|    const cpu = params.get('cpu');
120|    if (cpu) cpu.split(',').forEach(c => selectedCpu.add(c));
121|    const tags = params.get('tags');
122|    if (tags) tags.split(',').forEach(t => selectedTags.add(t));
123|    const priceRanges = params.get('priceRange');
124|    if (priceRanges) priceRanges.split(',').forEach(r => selectedPriceRanges.add(r));
125|    const screenSizes = params.get('screenSize');
126|    if (screenSizes) screenSizes.split(',').forEach(s => selectedScreenSizes.add(s));
127|    currentSort = params.get('sort') || 'newest';
128|    const sortSelect = document.getElementById('sortSelect');
129|    if (sortSelect) sortSelect.value = currentSort;
130|}
131|
132|// ===== 筛选逻辑 =====
133|function matchesFilters(p) {
134|    if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;
135|    if (selectedScreen) {
136|        const screenVal = selectedScreen.replace(/^\S+\s*/, '');
137|        if (p.screen_form !== screenVal) return false;
138|    }
139|    if (selectedCpu.size > 0) { let has = false; for (let c of selectedCpu) if (p.tags.includes(c)) { has = true; break; } if (!has) return false; }
140|    const tagsRequireBoth = new Set(['NFC', '红外', 'USB3.0', '无线充电', '防水', '潜望长焦', '6500mAh+', '≤200g', '散热风扇']);
141|    for (let t of selectedTags) {
142|        if (tagsRequireBoth.has(t)) {
143|            const inTags = p.tags.includes(t);
144|            const inFeatures = (p.features || []).some(f => f.includes(t));
145|            if (!inTags && !inFeatures) return false;
146|        } else {
147|            if (!p.tags.includes(t)) return false;
148|        }
149|    }
150|    // 价格范围筛选（多选，任一匹配即可）
151|    if (selectedPriceRanges.size > 0) {
152|        let inRange = false;
153|        for (let r of selectedPriceRanges) {
154|            const range = priceRanges.find(pr => pr.name === r);
155|            if (range && p.price >= range.min && p.price <= range.max) { inRange = true; break; }
156|        }
157|        if (!inRange) return false;
158|    }
159|    // 屏幕尺寸筛选（多选，任一匹配即可）
160|    if (selectedScreenSizes.size > 0) {
161|        let inSize = false;
162|        for (let s of selectedScreenSizes) {
163|            const range = screenSizeRanges.find(sr => sr.name === s);
164|            if (range && p.screen_size >= range.min && p.screen_size <= range.max) { inSize = true; break; }
165|        }
166|        if (!inSize) return false;
167|    }
168|    return true;
169|}
170|
171|// ===== 排序逻辑 =====
172|function normDate(d) {
173|    if (!d) return '';
174|    if (d.length === 7) return d + '-01';  // YYYY-MM → YYYY-MM-01（月初）
175|    return d;
176|}
177|function sortPhones(list) {
178|    const s = [...list];
179|    switch (currentSort) {
180|        case 'newest': s.sort((a, b) => normDate(b.release_date).localeCompare(normDate(a.release_date)) || a.model.localeCompare(b.model)); break;
181|        case 'price_asc': s.sort((a, b) => (a.price || 99999) - (b.price || 99999)); break;
182|        case 'price_desc': s.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
183|        case 'battery_desc': s.sort((a, b) => b.battery_mah - a.battery_mah); break;
184|        case 'weight_asc': s.sort((a, b) => (a.weight_g || 9999) - (b.weight_g || 9999)); break;
185|        case 'screen_desc': s.sort((a, b) => b.screen_size - a.screen_size); break;
186|        case 'charging_desc': s.sort((a, b) => b.charging_w - a.charging_w); break;
187|        case 'brand_asc': s.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)); break;
188|    }
189|    return s;
190|}
191|
192|// ===== 折叠屏屏幕显示 =====
193|function getFoldableScreenDisplay(phone) {
194|    // 检查是否是折叠屏
195|    if (phone.screen_unfolded && phone.screen_folded) {
196|        const unfolded = phone.screen_unfolded;
197|        const folded = phone.screen_folded;
198|        const foldType = phone.fold_type || '折叠屏';
199|        
200|        let display = '';
201|        
202|        if (foldType === '三折叠') {
203|            display = `三折叠 ${unfolded.size}英寸/${folded.size}英寸`;
204|        } else if (foldType === '横向折叠') {
205|            display = `横折 ${unfolded.size}英寸/${folded.size}英寸`;
206|        } else if (foldType === '纵向折叠') {
207|            display = `竖折 ${unfolded.size}英寸/${folded.size}英寸`;
208|        } else {
209|            display = `${unfolded.size}英寸/${folded.size}英寸`;
210|        }
211|        
212|        return display;
213|    }
214|    
215|    // 非折叠屏，使用原有逻辑
216|    return (phone.screen_size ? phone.screen_size + '英寸' : '') + (phone.screen_type ? ' ' + phone.screen_type : '') || '—';
217|}
218|
219|// ===== 折叠屏分辨率显示 =====
220|function getFoldableResolutionDisplay(phone) {
221|    if (phone.screen_unfolded && phone.screen_folded) {
222|        const unfolded = phone.screen_unfolded;
223|        const folded = phone.screen_folded;
224|        return `${unfolded.resolution || '—'} / ${folded.resolution || '—'}`;
225|    }
226|    return phone.resolution || '—';
227|}
228|
229|// ===== 折叠屏刷新率显示 =====
230|function getFoldableRefreshDisplay(phone) {
231|    if (phone.screen_unfolded && phone.screen_folded) {
232|        const unfolded = phone.screen_unfolded;
233|        const folded = phone.screen_folded;
234|        return `${unfolded.refresh_hz || '—'}Hz / ${folded.refresh_hz || '—'}Hz`;
235|    }
236|    return phone.refresh_hz ? phone.refresh_hz + 'Hz' : '—';
237|}
238|
239|// ===== 渲染统计 =====
240|function renderStats() {
241|    const total = phones.length;
242|    const brands = new Set(phones.map(p => p.brand)).size;
243|    document.getElementById('statBrands').textContent = brands;
244|    document.getElementById('statPhones').textContent = total;
245|}
246|
247|// ===== 渲染筛选标签 =====
248|function brandCount(brand) { return phones.filter(p => p.brand === brand).length; }
249|function getTagDisplayName(tag) { return tagDisplayNames[tag] || tag; }
250|
251|function renderBrandTags() {
252|    const c = document.getElementById('brandTags'); c.innerHTML = '';
253|    brandList.forEach(b => {
254|        const count = brandCount(b);
255|        const el = document.createElement('span');
256|        el.className = 'tag' + (selectedBrands.has(b) ? ' active brand-active-' + b : '');
257|        el.textContent = getEnglishBrand(b);
258|        el.dataset.count = count;
259|        el.onclick = () => { selectedBrands.has(b) ? selectedBrands.delete(b) : selectedBrands.add(b); updateHash(); refresh(); };
260|        c.appendChild(el);
261|    });
262|    const filtered = phones.filter(p => matchesFilters(p));
263|    document.getElementById('brandCount').textContent = `(${filtered.length} 款)`;
264|}
265|
266|function renderScreenTags() {
267|    const c = document.getElementById('screenTags'); c.innerHTML = '';
268|    screenTypes.forEach(s => {
269|        const el = document.createElement('span');
270|        el.className = 'tag screen' + (selectedScreen === s ? ' active' : '');
271|        el.textContent = s;
272|        el.onclick = () => { selectedScreen = selectedScreen === s ? null : s; updateHash(); refresh(); };
273|        c.appendChild(el);
274|    });
275|}
276|
277|function renderCpuTags() {
278|    const c = document.getElementById('cpuTags'); c.innerHTML = '';
279|    cpuTags.forEach(t => {
280|        const el = document.createElement('span');
281|        el.className = 'tag cpu' + (selectedCpu.has(t) ? ' active' : '');
282|        el.textContent = t;
283|        el.onclick = () => { selectedCpu.has(t) ? selectedCpu.delete(t) : selectedCpu.add(t); updateHash(); refresh(); };
284|        c.appendChild(el);
285|    });
286|}
287|
288|function renderFeatureTags() {
289|    const c = document.getElementById('featureTags'); 
290|    c.innerHTML = '';
291|    featureTags.forEach(t => {
292|        const el = document.createElement('span');
293|        el.className = 'tag' + (selectedTags.has(t) ? ' active' : '');
294|        el.textContent = getTagDisplayName(t);
295|        el.onclick = () => { 
296|            selectedTags.has(t) ? selectedTags.delete(t) : selectedTags.add(t); 
297|            updateHash(); 
298|            refresh(); 
299|        };
300|        c.appendChild(el);
301|    });
302|}
303|
304|function renderPriceRangeTags() {
305|    const container = document.getElementById('priceRangeTags');
306|    container.innerHTML = '';
307|    priceRanges.forEach(range => {
308|        const el = document.createElement('span');
309|        el.className = 'tag' + (selectedPriceRanges.has(range.name) ? ' active' : '');
310|        el.textContent = range.name;
311|        el.onclick = () => {
312|            selectedPriceRanges.has(range.name) ? selectedPriceRanges.delete(range.name) : selectedPriceRanges.add(range.name);
313|            updateHash();
314|            refresh();
315|        };
316|        container.appendChild(el);
317|    });
318|}
319|
320|function renderScreenSizeTags() {
321|    const container = document.getElementById('screenSizeTags');
322|    container.innerHTML = '';
323|    screenSizeRanges.forEach(range => {
324|        const el = document.createElement('span');
325|        el.className = 'tag' + (selectedScreenSizes.has(range.name) ? ' active' : '');
326|        el.textContent = range.name;
327|        el.onclick = () => {
328|            selectedScreenSizes.has(range.name) ? selectedScreenSizes.delete(range.name) : selectedScreenSizes.add(range.name);
329|            updateHash();
330|            refresh();
331|        };
332|        container.appendChild(el);
333|    });
334|}
335|
336|// ===== 当前筛选栏 =====
337|function renderActiveBar() {
338|    const bar = document.getElementById('activeBar'), badges = document.getElementById('activeBadges');
339|    const total = selectedBrands.size + (selectedScreen ? 1 : 0) + selectedCpu.size + selectedTags.size + selectedPriceRanges.size + selectedScreenSizes.size;
340|    if (total === 0) { bar.style.display = 'none'; return; }
341|    bar.style.display = 'flex'; badges.innerHTML = '';
342|    selectedBrands.forEach(b => addBadge(badges, getEnglishBrand(b), () => { selectedBrands.delete(b); updateHash(); refresh(); }));
343|    if (selectedScreen) addBadge(badges, selectedScreen, () => { selectedScreen = null; updateHash(); refresh(); });
344|    selectedCpu.forEach(c => addBadge(badges, c, () => { selectedCpu.delete(c); updateHash(); refresh(); }));
345|    selectedTags.forEach(t => addBadge(badges, getTagDisplayName(t), () => { selectedTags.delete(t); updateHash(); refresh(); }));
346|    selectedPriceRanges.forEach(r => addBadge(badges, r, () => { selectedPriceRanges.delete(r); updateHash(); refresh(); }));
347|    selectedScreenSizes.forEach(s => addBadge(badges, s, () => { selectedScreenSizes.delete(s); updateHash(); refresh(); }));
348|}
349|
350|function addBadge(c, t, r) {
351|    const el = document.createElement('span');
352|    el.className = 'active-badge';
353|    el.innerHTML = t + ' <span class="x">✕</span>';
354|    el.querySelector('.x').onclick = r;
355|    c.appendChild(el);
356|}
357|
358|// ===== 渲染手机卡片 =====
359|function renderPhones() {
360|    const filtered = sortPhones(phones.filter(matchesFilters));
361|    const grid = document.getElementById('phoneGrid');
362|    document.getElementById('resultCount').textContent = filtered.length;
363|
364|    if (filtered.length === 0) {
365|        grid.innerHTML = '<div class="no-results"><div class="emoji">🔍</div><p>没有找到符合条件的手机</p><p style="margin-top:8px;font-size:.85rem;color:var(--text-muted)">试试减少筛选条件、更换品牌或调整价格范围～</p></div>';
366|        return;
367|    }
368|
369|    grid.innerHTML = filtered.map(p => {
370|        const priceHtml = p.price ? '<span class="price-badge">¥' + p.price + '</span>' : '';
371|        const isCompareSelected = compareList.includes(p.id);
372|        const isExpanded = expandedCards.has(p.id);
373|
374|        const displayName = (() => {
375|            const m = p.model, b = p.brand;
376|            // Case-insensitive brand prefix check
377|            if (m.toLowerCase().startsWith(b.toLowerCase())) return m;
378|            // Known brand prefixes already in model name
379|            if (m.startsWith('iPhone') || m.startsWith('Galaxy') || m.startsWith('moto') || m.startsWith('Moto')) return m;
380|            // Chinese brand name already in model
381|            if ((b === 'Huawei' || b === 'HONOR' || b === 'OnePlus' || b === 'RedMagic' || b === 'Lenovo') && /^[一荣耀华红拯]/.test(m)) return m;
382|            if (b === 'OPPO' || b === 'REDMI') return m; // models already include brand
383|            // Prepend brand for bare model names (e.g. GT8, 13 Pro, S21)
384|            return b + ' ' + m;
385|        })();
386|
387|        const sc = [
388|            { l: '处理器', v: p.processor || '—' },
389|            { l: '内存/存储', v: (p.ram && p.storage) ? p.ram + ' + ' + p.storage : (p.ram || p.storage || '—') },
390|            { l: '屏幕', v: getFoldableScreenDisplay(p) || '—' },
391|            { l: '电池', v: p.battery_mah ? p.battery_mah + 'mAh' : '—' },
392|            { l: '有线充电', v: p.charging_w ? p.charging_w + 'W' : '—' },
393|            { l: '无线充电', v: p.wireless_charging_w ? p.wireless_charging_w + 'W' : '不支持' },
394|            { l: 'USB', v: p.usb_version || '—' },
395|            { l: '重量', v: p.weight_g ? p.weight_g + 'g' : '—' }
396|        ];
397|
398|        let detailHtml = '';
399|        if (p.detailed_camera) detailHtml += '<div class="detail-section"><div class="detail-title">📷 影像系统</div><div class="detail-row">' + p.detailed_camera + '</div></div>';
400|        if (!p.detailed_camera && p.camera_desc) detailHtml += '<div class="detail-section"><div class="detail-title">📷 影像系统</div><div class="detail-row">' + p.camera_desc + '</div></div>';
401|
402|        const ft = [];
403|        const addedTags = new Set();
404|        if (p.has_tele) { ft.push({ t: '🔭 潜望长焦', c: 'purple' }); addedTags.add('🔭 潜望长焦'); }
405|        if (p.screen_form === '折叠屏') { ft.push({ t: '📱 折叠屏', c: 'fold' }); addedTags.add('📱 折叠屏'); }
406|        if (p.tags.includes('无线充电')) { ft.push({ t: '🔋 无线充电', c: 'green' }); addedTags.add('🔋 无线充电'); }
407|        if (p.tags.includes('散热风扇')) { ft.push({ t: '🌀 散热风扇', c: 'red' }); addedTags.add('🌀 散热风扇'); }
408|        (p.features || []).forEach(f => {
409|            let tag = null;
410|            if (f.includes('IP68') || f.includes('IP69')) tag = { t: '💧 ' + f, c: 'blue' };
411|            else if (f.includes('NFC')) tag = { t: '📡 NFC', c: '' };
412|            else if (f.includes('红外')) tag = { t: '🔴 红外', c: 'amber' };
413|            else if (f === 'USB3.0') tag = { t: '🔌 USB 3.0', c: '' };
414|            else if (f === '6500mAh+') tag = { t: '🔋 6500mAh+', c: 'green' };
415|            else if (f === '≤200g') tag = { t: '🪶 ≤200g', c: 'green' };
416|            else tag = { t: f, c: '' };
417|            if (tag && !addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); }
418|        });
419|        p.tags.forEach(t => {
420|            if (cpuTags.includes(t)) { const tag = { t: '⚡ ' + t, c: 'cpu' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
421|            else if (t === '红外') { const tag = { t: '🔴 红外', c: 'amber' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
422|            else if (t === 'NFC') { const tag = { t: '📡 NFC', c: 'blue' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
423|            else if (t === 'USB3.0') { const tag = { t: '🔌 USB 3.0', c: 'blue' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
424|            else if (t === '6500mAh+') { const tag = { t: '🔋 6500mAh+', c: 'green' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
425|            else if (t === '≤200g') { const tag = { t: '🪶 ≤200g', c: 'green' }; if (!addedTags.has(tag.t)) { ft.push(tag); addedTags.add(tag.t); } }
426|        });
427|        const fh = ft.length > 0 ? '<div class="card-footer">' + ft.map(f => '<span class="feature-tag ' + f.c + '">' + f.t + '</span>').join('') + '</div>' : '';
428|
429|        const cardClass = ['phone-card'];
430|        cardClass.push('brand-border-' + p.brand);
431|        if (isCompareSelected) cardClass.push('compare-selected');
432|        if (compareMode) cardClass.push('compare-clickable');
433|
434|        return '<div class="' + cardClass.join(' ') + '" data-id="' + p.id + '">' +
435|            '<div class="card-header brand-header-' + p.brand + '">' +
436|                '<span class="brand-badge"><img class="brand-logo" src="' + brandLogos[p.brand] + '" alt="' + p.brand + '"></span>' +
437|                priceHtml +
438|                '<div class="phone-name">' + displayName + '</div>' +
439|            '</div>' +
440|            '<div class="card-body">' +
441|                '<div class="spec-grid">' + sc.map(s => '<div class="spec-cell"><div class="label">' + s.l + '</div><div class="value">' + s.v + '</div></div>').join('') + '</div>' +
442|                '<div class="card-expand"><button class="expand-btn" data-id="' + p.id + '">' + (isExpanded ? '收起 ▲' : '展开详情 ▼') + '</button></div>' +
443|                '<div class="card-details ' + (isExpanded ? 'open' : '') + '">' + detailHtml + '</div>' +
444|            '</div>' + fh +
445|        '</div>';
446|    }).join('');
447|
448|    bindCardEvents();
449|}
450|
451|// ===== 卡片事件绑定 =====
452|function bindCardEvents() {
453|    // 卡片点击 - 对比模式下选中/取消选中
454|    document.querySelectorAll('.phone-card').forEach(card => {
455|        card.onclick = (e) => {
456|            if (e.target.closest('.expand-btn')) return;
457|            if (compareMode) {
458|                const id = parseInt(card.dataset.id);
459|                toggleCompareSelection(id);
460|            }
461|        };
462|    });
463|
464|    // 展开/收起
465|    document.querySelectorAll('.expand-btn').forEach(btn => {
466|        btn.onclick = (e) => {
467|            e.stopPropagation();
468|            const id = parseInt(btn.dataset.id);
469|            if (expandedCards.has(id)) {
470|                expandedCards.delete(id);
471|            } else {
472|                expandedCards.add(id);
473|            }
474|            refresh();
475|        };
476|    });
477|}
478|
479|// ===== 对比功能 =====
480|function toggleCompareMode() {
481|    compareMode = !compareMode;
482|    const btn = document.getElementById('compareModeBtn');
483|
484|    if (compareMode) {
485|        btn.classList.add('active');
486|        btn.textContent = '📊 退出对比';
487|    } else {
488|        btn.classList.remove('active');
489|        btn.textContent = '📊 机型对比';
490|        compareList = [];
491|        updateCompareBar();
492|        document.getElementById('comparePanel').style.display = 'none';
493|    }
494|    refresh();
495|}
496|
497|function toggleCompareSelection(id) {
498|    if (!compareMode) return;
499|
500|    const idx = compareList.indexOf(id);
501|    if (idx >= 0) {
502|        compareList.splice(idx, 1);
503|    } else {
504|        if (compareList.length >= 4) {
505|            alert('最多只能对比 4 款机型哦～');
506|            return;
507|        }
508|        compareList.push(id);
509|    }
510|
511|    updateCompareBar();
512|    refresh();
513|}
514|
515|function updateCompareBar() {
516|    const bar = document.getElementById('compareBar');
517|    const countEl = document.getElementById('compareBarCount');
518|    const selectedEl = document.getElementById('compareBarSelected');
519|    const startBtn = document.getElementById('compareBarStart');
520|
521|    countEl.textContent = compareList.length;
522|
523|    if (compareList.length > 0) {
524|        bar.style.display = 'block';
525|    } else {
526|        bar.style.display = 'none';
527|    }
528|
529|    const selectedPhones = compareList.map(id => phones.find(p => p.id === id)).filter(Boolean);
530|    selectedEl.innerHTML = selectedPhones.map(p =>
531|        `<span class="selected-chip">${p.model}<span class="remove" data-id="${p.id}">✕</span></span>`
532|    ).join('');
533|
534|    selectedEl.querySelectorAll('.remove').forEach(btn => {
535|        btn.onclick = () => {
536|            const id = parseInt(btn.dataset.id);
537|            toggleCompareSelection(id);
538|        };
539|    });
540|
541|    startBtn.disabled = compareList.length < 2;
542|}
543|
544|function startCompare() {
545|    console.log('开始对比，当前对比列表长度:', compareList.length);
546|    if (compareList.length < 2) {
547|        console.log('对比机型数量不足，需要至少2款');
548|        return;
549|    }
550|    console.log('开始渲染对比面板');
551|    renderComparePanel();
552|    const panel = document.getElementById('comparePanel');
553|    if (panel) {
554|        panel.style.display = 'flex';
555|        console.log('对比面板已显示');
556|    } else {
557|        console.error('未找到对比面板元素');
558|    }
559|}
560|
561|function clearCompareSelection() {
562|    compareList = [];
563|    updateCompareBar();
564|    document.getElementById('comparePanel').style.display = 'none';
565|    refresh();
566|}
567|
568|function renderComparePanel() {
569|    const selected = phones.filter(p => compareList.includes(p.id));
570|    if (selected.length < 2) return;
571|
572|    const fields = [
573|        { l: '💰 价格', v: p => p.price ? '¥' + p.price : '—', best: 'min' },
574|        { l: '⚡ 处理器', v: p => p.processor || '—' },
575|        { l: '🧠 内存', v: p => p.ram || '—' },
576|        { l: '💾 存储', v: p => p.storage || '—' },
577|        { l: '📺 屏幕', v: p => getFoldableScreenDisplay(p) || '—' },
578|        { l: '🎨 分辨率', v: p => getFoldableResolutionDisplay(p) || '—' },
579|        { l: '🔄 刷新率', v: p => getFoldableRefreshDisplay(p) || '—', best: 'max' },
580|        { l: '🔋 电池', v: p => p.battery_mah ? p.battery_mah + 'mAh' : '—', best: 'max' },
581|        { l: '🔌 有线充电', v: p => p.charging_w ? p.charging_w + 'W' : '—', best: 'max' },
582|        { l: '📶 无线充电', v: p => p.wireless_charging_w ? p.wireless_charging_w + 'W' : '不支持', best: 'max' },
583|        { l: '🔗 USB', v: p => p.usb_version || '—' },
584|        { l: '⚖️ 重量', v: p => p.weight_g ? p.weight_g + 'g' : '—', best: 'min' },
585|        { l: '📱 系统', v: p => p.os || '—' },
586|        { l: '📐 屏幕形态', v: p => p.screen_form || '—' },
587|        { l: '💧 防水', v: p => {
588|            const tags = p.tags || [];
589|            const feats = p.features || [];
590|            if (tags.includes('防水') || feats.some(f => f.includes('IP68') || f.includes('IP69'))) return '✅ 支持';
591|            return '—';
592|        }},
593|        { l: '📡 NFC', v: p => {
594|            const tags = p.tags || [];
595|            const feats = p.features || [];
596|            if (tags.includes('NFC') || feats.some(f => f.includes('NFC'))) return '✅ 支持';
597|            return '—';
598|        }},
599|        { l: '🔴 红外', v: p => {
600|            const tags = p.tags || [];
601|            const feats = p.features || [];
602|            if (tags.includes('红外') || feats.some(f => f.includes('红外'))) return '✅ 支持';
603|            return '—';
604|        }},
605|        { l: '📷 潜望长焦', v: p => p.has_tele ? '✅ 支持' : '—' },
606|        { l: '📅 发布日期', v: p => p.release_date || '—' },
607|    ];
608|
609|    // 找出每个参数的最佳值
610|    const bestValues = {};
611|    fields.forEach(f => {
612|        if (f.best) {
613|            const values = selected.map(p => {
614|                const val = f.v(p);
615|                // 提取数字进行比较
616|                const numMatch = val.match(/(\d+)/);
617|                return numMatch ? parseInt(numMatch[1]) : 0;
618|            });
619|            
620|            if (f.best === 'min') {
621|                bestValues[f.l] = Math.min(...values);
622|            } else if (f.best === 'max') {
623|                bestValues[f.l] = Math.max(...values);
624|            }
625|        }
626|    });
627|
628|    let html = '<table class="compare-table"><thead><tr><th><span class="param-label">参数</span></th>';
629|    selected.forEach(p => {
630|        html += '<th><div class="phone-name-badge">' + p.model + '</div><small style="opacity:.8;display:block;margin-top:4px">' + getEnglishBrand(p.brand) + '</small><button class="compare-remove" data-id="' + p.id + '">✕ 移除</button></th>';
631|    });
632|    html += '</tr></thead><tbody>';
633|    fields.forEach(f => {
634|        html += '<tr><th>' + f.l + '</th>';
635|        selected.forEach(p => {
636|            const value = f.v(p);
637|            let displayValue = value;
638|            
639|            // 检查是否是最佳值
640|            if (f.best && bestValues[f.l]) {
641|                const numMatch = value.match(/(\d+)/);
642|                if (numMatch) {
643|                    const numValue = parseInt(numMatch[1]);
644|                    if (numValue === bestValues[f.l]) {
645|                        displayValue = '<span class="best">' + value + '</span> 🏆';
646|                    }
647|                }
648|            }
649|            
650|            html += '<td>' + displayValue + '</td>';
651|        });
652|        html += '</tr>';
653|    });
654|    html += '</tbody></table>';
655|
656|    // 保留雷达图容器
657|    html += '<div id="radarChartContainer" style="display:none; margin-bottom:20px;"><canvas id="radarChart" width="400" height="400"></canvas><div id="radarLegend" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:12px;padding:0 16px"></div></div>';
658|
659|    document.getElementById('comparePanelBody').innerHTML = html;
660|
661|    document.querySelectorAll('.compare-remove').forEach(btn => {
662|        btn.onclick = () => { toggleCompareSelection(parseInt(btn.dataset.id)); };
663|    });
664|    
665|    // 绘制雷达图
666|    drawRadarChart(selected);
667|}
668|
669|// ===== 刷新 =====
670|function refresh() {
671|    renderBrandTags();
672|    renderScreenTags();
673|    renderCpuTags();
674|    renderFeatureTags();
675|    renderPriceRangeTags();
676|    renderScreenSizeTags();
677|    renderActiveBar();
678|    renderPhones();
679|}
680|
681|// ===== 暗色模式切换 =====
682|function toggleDarkMode() {
683|    const body = document.body;
684|    const toggle = document.getElementById('darkModeToggle');
685|    
686|    body.classList.toggle('dark-mode');
687|    
688|    if (body.classList.contains('dark-mode')) {
689|        toggle.textContent = '☀️';
690|        localStorage.setItem('darkMode', 'true');
691|    } else {
692|        toggle.textContent = '🌙';
693|        localStorage.setItem('darkMode', 'false');
694|    }
695|}
696|
697|// ===== 雷达图绘制 =====
698|function drawRadarChart(phones) {
699|    const canvas = document.getElementById('radarChart');
700|    const container = document.getElementById('radarChartContainer');
701|    
702|    if (!canvas || !container || phones.length < 2) {
703|        if (container) container.style.display = 'none';
704|        return;
705|    }
706|    
707|    container.style.display = 'flex';
708|    
709|    const ctx = canvas.getContext('2d');
710|    const width = canvas.width;
711|    const height = canvas.height;
712|    const centerX = width / 2;
713|    const centerY = height / 2;
714|    const radius = Math.min(width, height) / 2 - 60;
715|    
716|    // 清空画布
717|    ctx.clearRect(0, 0, width, height);
718|    
719|    // 定义参数维度
720|    const dimensions = [
721|        { name: '性能', key: 'performance', max: 100 },
722|        { name: '屏幕', key: 'screen', max: 100 },
723|        { name: '拍照', key: 'camera', max: 100 },
724|        { name: '电池', key: 'battery', max: 100 },
725|        { name: '充电', key: 'charging', max: 100 },
726|        { name: '性价比', key: 'value', max: 100 }
727|    ];
728|    
729|    // 计算每款手机的参数分数
730|    const phoneScores = phones.map(phone => {
731|        const scores = {};
732|        
733|        // 性能分数（基于处理器）
734|        const processor = phone.processor || '';
735|        if (processor.includes('Elite') || processor.includes('天玑9500') || processor.includes('麒麟9030')) {
736|            scores.performance = 95;
737|        } else if (processor.includes('天玑9400') || processor.includes('麒麟9020') || processor.includes('A19')) {
738|            scores.performance = 90;
739|        } else if (processor.includes('8 Gen') || processor.includes('天玑8')) {
740|            scores.performance = 80;
741|        } else {
742|            scores.performance = 70;
743|        }
744|        
745|        // 屏幕分数（基于刷新率和分辨率）
746|        let refreshRate = phone.refresh_hz || 60;
747|        let hasHighRes = phone.resolution && (phone.resolution.includes('2K') || phone.resolution.includes('1440'));
748|        
749|        // 如果是折叠屏，使用展开时的参数
750|        if (phone.screen_unfolded) {
751|            refreshRate = phone.screen_unfolded.refresh_hz || 60;
752|            hasHighRes = phone.screen_unfolded.resolution && (phone.screen_unfolded.resolution.includes('2K') || phone.screen_unfolded.resolution.includes('1440'));
753|        }
754|        
755|        scores.screen = Math.min(100, (refreshRate / 144) * 60 + (hasHighRes ? 40 : 30));
756|        
757|        // 拍照分数（基于摄像头描述）
758|        const cameraDesc = phone.camera_desc || '';
759|        if (cameraDesc.includes('潜望') || cameraDesc.includes('长焦')) {
760|            scores.camera = 90;
761|        } else if (cameraDesc.includes('主摄') && cameraDesc.includes('超广角')) {
762|            scores.camera = 80;
763|        } else {
764|            scores.camera = 70;
765|        }
766|        
767|        // 电池分数（基于电池容量）
768|        const battery = phone.battery_mah || 4000;
769|        scores.battery = Math.min(100, (battery / 6000) * 100);
770|        
771|        // 充电分数（基于充电功率）
772|        const charging = phone.charging_w || 18;
773|        scores.charging = Math.min(100, (charging / 120) * 100);
774|        
775|        // 性价比分数（基于价格和配置）
776|        const price = phone.price || 5000;
777|        const overallScore = (scores.performance + scores.screen + scores.camera + scores.battery + scores.charging) / 5;
778|        scores.value = Math.min(100, overallScore * (5000 / Math.max(price, 1000)));
779|        
780|        return {
781|            name: phone.model,
782|            brand: phone.brand,
783|            scores: scores
784|        };
785|    });
786|    
787|    // 颜色配置
788|    const colors = [
789|        'rgba(99, 102, 241, 0.55)',   // indigo
790|        'rgba(236, 72, 153, 0.55)',   // pink
791|        'rgba(52, 211, 153, 0.55)',   // emerald
792|        'rgba(251, 146, 60, 0.55)'    // amber
793|    ];
794|    
795|    const borderColors = [
796|        'rgba(99, 102, 241, 1)',
797|        'rgba(236, 72, 153, 1)',
798|        'rgba(52, 211, 153, 1)',
799|        'rgba(251, 146, 60, 1)'
800|    ];
801|    
802|    // 绘制背景网格
803|    const numSides = dimensions.length;
804|    const angleStep = (Math.PI * 2) / numSides;
805|    
806|    // 绘制同心多边形
807|    for (let level = 5; level >= 1; level--) {
808|        const levelRadius = (radius / 5) * level;
809|        ctx.beginPath();
810|        for (let i = 0; i <= numSides; i++) {
811|            const angle = angleStep * i - Math.PI / 2;
812|            const x = centerX + levelRadius * Math.cos(angle);
813|            const y = centerY + levelRadius * Math.sin(angle);
814|            if (i === 0) {
815|                ctx.moveTo(x, y);
816|            } else {
817|                ctx.lineTo(x, y);
818|            }
819|        }
820|        ctx.closePath();
821|        ctx.strokeStyle = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
822|        ctx.stroke();
823|    }
824|    
825|    // 绘制轴线和标签
826|    for (let i = 0; i < numSides; i++) {
827|        const angle = angleStep * i - Math.PI / 2;
828|        const x = centerX + radius * Math.cos(angle);
829|        const y = centerY + radius * Math.sin(angle);
830|        
831|        // 轴线
832|        ctx.beginPath();
833|        ctx.moveTo(centerX, centerY);
834|        ctx.lineTo(x, y);
835|        ctx.strokeStyle = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
836|        ctx.stroke();
837|        
838|        // 标签
839|        const labelX = centerX + (radius + 25) * Math.cos(angle);
840|        const labelY = centerY + (radius + 25) * Math.sin(angle);
841|        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#f1f5f9' : '#0f172a';
842|        ctx.font = 'bold 12px sans-serif';
843|        ctx.textAlign = 'center';
844|        ctx.textBaseline = 'middle';
845|        ctx.fillText(dimensions[i].name, labelX, labelY);
846|    }
847|    
848|    // 绘制每款手机的数据区域
849|    phoneScores.forEach((phoneData, index) => {
850|        if (index >= colors.length) return;
851|        
852|        ctx.beginPath();
853|        for (let i = 0; i <= numSides; i++) {
854|            const dimension = dimensions[i % numSides];
855|            const score = phoneData.scores[dimension.key] || 50;
856|            const normalizedScore = score / dimension.max;
857|            const angle = angleStep * (i % numSides) - Math.PI / 2;
858|            const x = centerX + radius * normalizedScore * Math.cos(angle);
859|            const y = centerY + radius * normalizedScore * Math.sin(angle);
860|            
861|            if (i === 0) {
862|                ctx.moveTo(x, y);
863|            } else {
864|                ctx.lineTo(x, y);
865|            }
866|        }
867|        ctx.closePath();
868|        ctx.fillStyle = colors[index];
869|        ctx.fill();
870|        ctx.strokeStyle = borderColors[index];
871|        ctx.lineWidth = 2;
872|        ctx.stroke();
873|    });
874|    
875|    // 绘制图例（HTML方式，可靠显示机型名称）
876|    const legendEl = document.getElementById('radarLegend');
877|    if (legendEl) {
878|        legendEl.innerHTML = phoneScores.map((pd, i) => {
879|            const color = colors[i % colors.length];
880|            const borderColor = borderColors[i % borderColors.length];
881|            return '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:var(--bg);border-radius:20px;font-size:.8rem;border:1px solid ' + borderColor + '">' +
882|                '<span style="width:10px;height:10px;border-radius:2px;background:' + color + ';display:inline-block"></span>' +
883|                '<span style="color:var(--text);font-weight:600">' + pd.name + '</span>' +
884|                '</span>';
885|        }).join('');
886|    }
887|}
888|
889|// ===== 初始化 =====
890|function init() {
891|    renderStats();
892|    refresh();
893|    setupEventListeners();
894|}
895|
896|// ===== 事件监听 =====
897|function setupEventListeners() {
898|    document.getElementById('sortSelect').addEventListener('change', e => {
899|        currentSort = e.target.value;
900|        updateHash();
901|        refresh();
902|    });
903|    // 筛选区折叠
904|    document.querySelectorAll('.filter-label').forEach(label => {
905|        label.addEventListener('click', () => {
906|            const section = label.parentElement;
907|            section.classList.toggle('collapsed');
908|        });
909|    });
910|    document.getElementById('clearAll').addEventListener('click', () => {
911|        selectedBrands.clear();
912|        selectedScreen = null;
913|        selectedCpu.clear();
914|        selectedTags.clear();
915|        selectedPriceRanges.clear();
916|        selectedScreenSizes.clear();
917|        compareList = [];
918|        compareMode = false;
919|        document.getElementById('compareModeBtn').classList.remove('active');
920|        document.getElementById('compareModeBtn').textContent = '📊 机型对比';
921|        updateHash();
922|        refresh();
923|    });
924|
925|    // 对比模式按钮
926|    document.getElementById('compareModeBtn').addEventListener('click', toggleCompareMode);
927|    document.getElementById('compareBarStart').addEventListener('click', startCompare);
928|    document.getElementById('compareBarClear').addEventListener('click', clearCompareSelection);
929|
930|    // 暗色模式切换
931|    const darkModeToggle = document.getElementById('darkModeToggle');
932|    darkModeToggle.addEventListener('click', toggleDarkMode);
933|    
934|    // 从本地存储加载暗色模式设置
935|    if (localStorage.getItem('darkMode') === 'true') {
936|        document.body.classList.add('dark-mode');
937|        darkModeToggle.textContent = '☀️';
938|    }
939|
940|    // 关闭对比面板
941|    document.getElementById('comparePanelClose').addEventListener('click', () => {
942|        document.getElementById('comparePanel').style.display = 'none';
943|    });
944|    document.getElementById('comparePanelOverlay').addEventListener('click', () => {
945|        document.getElementById('comparePanel').style.display = 'none';
946|    });
947|
948|    // 对比选择栏关闭按钮
949|    document.getElementById('compareBarClose').addEventListener('click', () => {
950|        compareList = [];
951|        compareMode = false;
952|        document.getElementById('compareModeBtn').classList.remove('active');
953|        document.getElementById('compareModeBtn').textContent = '📊 机型对比';
954|        updateCompareBar();
955|        document.getElementById('comparePanel').style.display = 'none';
956|        refresh();
957|    });
958|
959|    // 键盘快捷键
960|    document.addEventListener('keydown', e => {
961|        if (e.key === 'Escape') {
962|            if (compareList.length > 0) {
963|                compareList = [];
964|                updateCompareBar();
965|                document.getElementById('comparePanel').style.display = 'none';
966|                refresh();
967|            }
968|        }
969|    });
970|
971|    // 回到顶部
972|    const backTop = document.getElementById('backTop');
973|    if (backTop) {
974|        window.addEventListener('scroll', () => {
975|            backTop.style.display = window.scrollY > 500 ? '' : 'none';
976|        }, { passive: true });
977|        backTop.addEventListener('click', () => {
978|            window.scrollTo({ top: 0, behavior: 'smooth' });
979|        });
980|    }
981|}
982|
983|// 启动
984|loadData();