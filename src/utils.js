// ===== 配置数据 =====
export const cpuTags = ["骁龙8 Elite 5","骁龙8 Elite 1","骁龙8 Gen5","天玑9500","天玑8500","麒麟9030","麒麟9020","天玑9400","麒麟9010s","A19","A18"]

export const featureTags = ["潜望长焦","6500mAh+","≤200g","防尘抗水","NFC","红外","USB3.0","无线充电","散热风扇","有线投屏"]

export const screenSizeRanges = [
  { name: "6英寸左右", min: 5.7, max: 6.3 },
  { name: "6.5英寸左右", min: 6.2, max: 6.8 },
  { name: "7英寸左右", min: 6.7, max: 7.5 }
]

export const screenTypes = ['📱 直屏','🔄 折叠屏']

export const textLogoBrands = new Set(['Samsung','OPPO','REDMI','iQOO','HONOR','vivo','realme'])

export const largeLogoBrands = new Set(['OPPO','vivo','RedMagic'])

export function getLogoStyle(brand) {
  return largeLogoBrands.has(brand) ? 'height:32px;width:auto' : 'height:22px;width:auto'
}

// ===== 品牌标签颜色 =====
export const brandAccentColors = {
  'Apple':'#1a1a2e','Huawei':'#BC2D32','Xiaomi':'#FF4800',
  'OPPO':'#6DFB73','vivo':'#7C3AED','Samsung':'#2563eb',
  'HONOR':'#222222','REDMI':'#D82F44','iQOO':'#FFD700',
  'OnePlus':'#E73421','realme':'#EAB51D','RedMagic':'#b91c1c',
  'Motorola':'#D43D2D','Lenovo':'#D43D2D'
}

// ===== 品牌 LOGO（base64 SVG data URI）=====
export const brandLogos = {
  'Apple': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5BcHBsZTwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyLjE1MiA2Ljg5NmMtLjk0OCAwLTIuNDE1LTEuMDc4LTMuOTYtMS4wNC0yLjA0LjAyNy0zLjkxIDEuMTgzLTQuOTYxIDMuMDE0LTIuMTE3IDMuNjc1LS41NDYgOS4xMDMgMS41MTkgMTIuMDkgMS4wMTMgMS40NTQgMi4yMDggMy4wOSAzLjc5MiAzLjAzOSAxLjUyLS4wNjUgMi4wOS0uOTg3IDMuOTM1LS45ODcgMS44MzEgMCAyLjM1Ljk4NyAzLjk2Ljk0OCAxLjYzNy0uMDI2IDIuNjc2LTEuNDggMy42NzYtMi45NDggMS4xNTYtMS42ODggMS42MzYtMy4zMjUgMS42NjItMy40MTUtLjAzOS0uMDEzLTMuMTgyLTEuMjIxLTMuMjItNC44NTctLjAyNi0zLjA0IDIuNDgtNC40OTQgMi41OTctNC41NTktMS40MjktMi4wOS0zLjYyMy0yLjMyNC00LjM5LTIuMzc2LTItLjE1Ni0zLjY3NSAxLjA5LTQuNjEgMS4wOXpNMTUuNTMgMy44M2MuODQzLTEuMDEyIDEuNC0yLjQyNyAxLjI0NS0zLjgzLTEuMjA3LjA1Mi0yLjY2Mi44MDUtMy41MzIgMS44MTgtLjc4Ljg5Ni0xLjQ1NCAyLjMzOC0xLjI3MyAzLjcxNCAxLjMzOC4xMDQgMi43MTUtLjY4OCAzLjU1OS0xLjcwMSIvPjwvc3ZnPg==',
  'HONOR': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5Ib25vcjwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIuNjAxIDkuNzUzdjEuODIzSC44MDdWOS43NTNIMHY0LjQ5OGguODA3di0xLjg3NGgxLjc5NHYxLjg3NGguODA3VjkuNzUzaC0uODA3Wm0xOC42NzEuODAxaC44OThjLjM2OSAwIC42NjcuMjk3LjY2Ny42NjJhLjY2NS42NjUgMCAwIDEtLjY2Ny42NjNoLS44OTh2LTEuMzI1Wm0tLjgwNi0uODAxdjQuNDk4aC44MDZ2LTIuMDAybDEuNjggMi4wMDJIMjRsLTEuMzc2LTEuNjRhMS40NjIgMS40NjIgMCAwIDAtLjQ0NC0yLjg1OGgtMS43MTYuMDAyWm0tNy42My0uMDE0djIuODA3bC0xLjk1OS0yLjgwN2gtLjY0NHY0LjQ5OGguODA3di0yLjgybDEuOTY4IDIuODJoLjYzM1Y5LjczOWgtLjgwNVptLTcuNTMyIDIuMjZjMC0uODMyLjY4LTEuNTA2IDEuNTE3LTEuNTA2QTEuNTEgMS41MSAwIDAgMSA4LjMzNyAxMmMwIC44MzItLjY3OSAxLjUwNi0xLjUxNiAxLjUwNi0uNDAzIDAtLjc4OS0uMTU5LTEuMDczLS40NDFBMS41MDQgMS41MDQgMCAwIDEgNS4zMDQgMTJ2LS4wMDFaTTQuNDk3IDEyYzAgLjkzMy41NjYgMS43NzQgMS40MzQgMi4xMzIuODY5LjM1NyAxLjg2OC4xNiAyLjUzMy0uNS42NjQtLjY2Ljg2My0xLjY1My41MDMtMi41MTVhMi4zMjQgMi4zMjQgMCAwIDAtMi4xNDYtMS40MjUgMi4zMTYgMi4zMTYgMCAwIDAtMi4zMjMgMi4zMDdMNC40OTcgMTJabTExLjA0LS4wMDFhMS41MTMgMS41MTMgMCAwIDEgMS41MTgtMS41MDZjLjgzOCAwIDEuNTE2LjY3NSAxLjUxNiAxLjUwN2ExLjUxMyAxLjUxMyAwIDAgMS0xLjUxOCAxLjUwNmMtLjQwMiAwLS43ODgtLjE1OS0xLjA3Mi0uNDQxYTEuNSAxLjUgMCAwIDEtLjQ0NC0xLjA2NlpNMTQuNzMgMTJjMCAuOTMzLjU2NiAxLjc3NCAxLjQzNCAyLjEzMi44NjguMzU3IDEuODY4LjE2IDIuNTMyLS41LjY2NS0uNjYuODY0LTEuNjUzLjUwNC0yLjUxNWEyLjMyNSAyLjMyNSAwIDAgMC0yLjE0Ny0xLjQyNSAyLjMxNiAyLjMxNiAwIDAgMC0yLjMyMyAyLjMwN1YxMloiLz48L3N2Zz4K',
  'Huawei': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5IdWF3ZWk8L3RpdGxlPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zLjY3IDYuMTRTMS44MiA3LjkxIDEuNzIgOS43OHYuMzVjLjA4IDEuNTEgMS4yMiAyLjQgMS4yMiAyLjQgMS44MyAxLjc5IDYuMjYgNC4wNCA3LjMgNC41NSAwIDAgLjA2LjAzLjEtLjAxbC4wMi0uMDR2LS4wNEM3LjUyIDEwLjggMy42NyA2LjE0IDMuNjcgNi4xNHpNOS42NSAxOC42Yy0uMDItLjA4LS4xLS4wOC0uMS0uMDhsLTcuMzguMjZjLjggMS40MyAyLjE1IDIuNTMgMy41NiAyLjIuOTYtLjI1IDMuMTYtMS43OCAzLjg4LTIuMy4wNi0uMDUuMDQtLjA5LjA0LS4wOXptLjA4LS43OEM2LjQ5IDE1LjYzLjIxIDEyLjI4LjIxIDEyLjI4Yy0uMTUuNDYtLjIuOS0uMjEgMS4zdi4wN2MwIDEuMDcuNCAxLjgyLjQgMS44Mi44IDEuNjkgMi4zNCAyLjIgMi4zNCAyLjIuNy4zIDEuNC4zMSAxLjQuMzEuMTIuMDIgNC40IDAgNS41NCAwIC4wNSAwIC4wOC0uMDUuMDgtLjA1di0uMDZjMC0uMDMtLjAzLS4wNS0uMDMtLjA1ek05LjA2IDMuMTlhMy40MiAzLjQyIDAgMDAtMi41NyAzLjE1di40MWMuMDMuNi4xNiAxLjA1LjE2IDEuMDUuNjYgMi45IDMuODYgNy42NSA0LjU1IDguNjUuMDUuMDUuMS4wMy4xLjAzYS4xLjEgMCAwMC4wNi0uMWMxLjA2LTEwLjYtMS4xMS0xMy40Mi0xLjExLTEzLjQyLS4zMi4wMi0xLjE5LjIzLTEuMTkuMjN6bTguMjk5IDIuMjdzLS40OS0xLjgtMi40NC0yLjI4YzAgMC0uNTctLjE0LTEuMTctLjIyIDAgMC0yLjE4IDIuODEtMS4xMiAxMy40My4wMS4wNy4wNi4wOC4wNi4wOC4wNy4wMy4xLS4wMy4xLS4wMy43Mi0xLjAzIDMuOS01Ljc2IDQuNTUtOC42NCAwIDAgLjM2LTEuNC4wMi0yLjM0em0tMi45MiAxMy4wN3MtLjA3IDAtLjA5LjA1YzAgMC0uMDEuMDcuMDMuMS43LjUxIDIuODUgMiAzLjg4IDIuMyAwIDAgLjE2LjA1LjQzLjA2aC4xNGMuNjktLjAyIDEuOS0uMzcgMy0yLjI2bC03LjQtLjI1em03LjgzLTguNDFjLjE0LTIuMDYtMS45NC0zLjk3LTEuOTQtMy45OCAwIDAtMy44NSA0LjY2LTYuNjcgMTAuOCAwIDAtLjAzLjA4LjAyLjEzbC4wNC4wMWguMDZjMS4wNi0uNTMgNS40Ni0yLjc3IDcuMjgtNC41NCAwIDAgMS4xNS0uOTMgMS4yMS0yLjQyem0xLjUyIDIuMTRzLTYuMjggMy4zNy05LjUyIDUuNTVjMCAwLS4wNS4wNC0uMDMuMTEgMCAwIC4wMy4wNi4wNy4wNiAxLjE2IDAgNS41NiAwIDUuNjctLjAyIDAgMCAuNTctLjAyIDEuMjctLjI5IDAgMCAxLjU2LS41IDIuMzctMi4yNyAwIDAgLjczLTEuNDUuMTctMy4xNHoiLz48L3N2Zz4=',
  'Lenovo': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5MZW5vdm88L3RpdGxlPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMS4wNDQgMTIuMjg4YzAgLjUtLjM0My44NjctLjgxNS44NjctLjQ2NCAwLS44MjctLjM4LS44MjctLjg2NyAwLS41MS4zNDMtLjg2OC44MTUtLjg2OC40NjQgMCAuODI3LjM4MS44MjcuODY4em0tMTQuMzA1LS45MmEuNzg3Ljc4NyAwIDAgMC0uNjUxLjMwNy45OTEuOTkxIDAgMCAwLS4xNzIuNzM4bDEuNDc5LS42MTRhLjcwOC43MDggMCAwIDAtLjY1Ni0uNDN6bTYuOTYzLjA1MmMtLjQ3MiAwLS44MTYuMzU4LS44MTYuODY4IDAgLjQ4Ni4zNjQuODY3LjgyOC44NjcuNDcyIDAgLjgxNS0uMzY4LjgxNS0uODY3IDAtLjQ4Ny0uMzYzLS44NjgtLjgyNy0uODY4ek0yNCA3Ljk5N3Y4LjAwNkgwVjcuOTk3aDI0ek01LjAxIDEzLjA1SDMuMDg4VjkuODI1SDIuMjN2NC4wMDNoMi43OHYtLjc3N3ptMS4xMzctLjA5NGwyLjE2My0uODk3YTEuNjY3IDEuNjY3IDAgMCAwLS4zNy0uODZjLS4yODQtLjMzLS43MDQtLjUwNS0xLjIxNi0uNTA1LS45MzEgMC0xLjYzMy42ODYtMS42MzMgMS41OTMgMCAuOTMuNzA0IDEuNTkzIDEuNzI2IDEuNTkzLjU3MiAwIDEuMTU4LS4yNzIgMS40MzItLjU4OWwtLjUzNS0uNDExYy0uMzU3LjI2NC0uNTYuMzI2LS44ODUuMzI2LS4yOTIgMC0uNTItLjA5LS42ODItLjI1em01LjU3LTEuMDM5YzAtLjcwOS0uNTA3LTEuMjIzLTEuMjUyLTEuMjIzYTEuMjggMS4yOCAwIDAgMC0xLjAwNS40OTR2LS40NDJoLS44NDZ2My4wODFoLjg0NnYtMS43NTNjMC0uMzE2LjI0NS0uNjUxLjY5OC0uNjUxLjM1IDAgLjcxMi4yNDMuNzEyLjY1MXYxLjc1M2guODQ3di0xLjkxem0zLjY0Ny4zN2MwLS45MDQtLjcyNS0xLjU5My0xLjY1LTEuNTkzLS45MzMgMC0xLjY2My43LTEuNjYzIDEuNTkzIDAgLjkwMy43MjYgMS41OTIgMS42NTEgMS41OTIuOTMyIDAgMS42NjItLjcgMS42NjItMS41OTJ6bTIuMDY2IDEuNTRsMS4yNjgtMy4wODFoLS45NjdsLS43NjUgMi4wOTktLjc2NS0yLjFoLS45NjZsMS4yNjggMy4wODFoLjk1M3ptNC40NDktMS41NGMwLS45MDQtLjcyNS0xLjU5My0xLjY1LTEuNTkzLS45MzIgMC0xLjY2Mi43LTEuNjYyIDEuNTkzIDAgLjkwMy43MjUgMS41OTIgMS42NSAxLjU5Mi45MzIgMCAxLjY2Mi0uNyAxLjY2Mi0xLjU5MnoiLz48L3N2Zz4=',
  'Motorola': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5Nb3Rvcm9sYTwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJDMjQuMDAyIDUuMzc1IDE4LjYzMi4wMDIgMTIuMDA3IDBIMTJ6bTcuMzI3IDE4LjA2NXMtLjU4MS0yLjYyNy0xLjUyOC00LjE5N2MtLjUxNC0uODU3LTEuMzA4LTEuNTUzLTIuMzY4LTEuNTMyLS43NDUgMC0xLjM5OS40MjMtMi4yIDEuNTUzLS40NjkuNzctLjg4MiAxLjU3My0xLjIzNSAyLjQwMyAwIDAtLjI5LS42NzUtLjYzLTEuMzQzYTguMDM4IDguMDM4IDAgMCAwLS42MDUtMS4wNDljLS44MDQtMS4xMy0xLjQ1NS0xLjUzOS0yLjItMS41NTMtMS4wNDktLjAyMS0xLjg1NC42NzUtMi4zNjQgMS41MjgtLjk0OCAxLjU3NC0xLjUyOCA0LjE5Ny0xLjUyOCA0LjE5N2gtLjg2NGw0LjYwNi0xNS4xMiAzLjU2IDExLjgwNC4wMjQuMDIxLjAyNC0uMDIxIDMuNTYtMTEuODA0IDQuNjEgMTUuMTEzaC0uODYyeiIvPjwvc3ZnPg==',
  'OPPO': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgdmlld0JveD0iMCAwIDI4IDI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgcng9IjQiIGZpbGw9IiNmZmYiLz4KICA8cGF0aCBmaWxsPSIjMDAwIiBkPSJNMy44NSAxNS43ODZoLS4wMDFDMi42MzkgMTUuNzc0IDEuODU4IDE1LjIgMS44NTggMTQuMzIxcy43ODEtMS40NTIgMS45OS0xLjQ2NWMxLjIxLjAxMyAxLjk5Mi41ODggMS45OTIgMS40NjVzLS43ODIgMS40NTMtMS45OSAxLjQ2NXptLjAzNC0zLjYzOGgtLjA3M0MyLjE1NiAxMi4xNzUgMSAxMy4wNjggMSAxNC4zMnMxLjE1NiAyLjE0NyAyLjgxMSAyLjE3NGguMDczYzEuNjU1LS4wMjcgMi44MTEtLjkyMSAyLjgxMS0yLjE3NHMtMS4xNTYtMi4xNDYtMi44MTEtMi4xNzN6bTE4LjI3IDMuNjM4Yy0xLjIxLS4wMTItMS45OTItLjU4Ny0xLjk5Mi0xLjQ2NXMuNzgyLTEuNDUyIDEuOTkxLTEuNDY1YzEuMjEuMDEzIDEuOTkxLjU4OCAxLjk5MSAxLjQ2NXMtLjc4MSAxLjQ1My0xLjk5IDEuNDY1em0uMDM1LTMuNjM4aC0uMDczYy0xLjY1NS4wMjctMi44MTEuOTItMi44MTEgMi4xNzNzMS4xNTYgMi4xNDcgMi44MTEgMi4xNzRoLjA3M0MyMy44NDQgMTYuNDY4IDI1IDE1LjU3NCAyNSAxNC4zMnMtMS4xNTYtMi4xNDYtMi44MTEtMi4xNzN6bS02LjEyNiAzLjYzOGMtMS4yMS0uMDEyLTEuOTktLjU4Ny0xLjk5LTEuNDY1cy43OC0xLjQ1MiAxLjk5LTEuNDY1YzEuMjEuMDEzIDEuOTkxLjU4OCAxLjk5MSAxLjQ2NXMtLjc4MSAxLjQ1My0xLjk5IDEuNDY1em0uMDM2LTMuNjM4aC0uMDczYy0uNzg5LjAxMy0xLjQ2NC4yMjItMS45NTUuNTc0di0uMzdoLS44NTd2NS41aC44NTd2LTEuOTMxYy40OS4zNTEgMS4xNjYuNTYgMS45NTQuNTc0aC4wNzRjMS42NTUtLjAyNyAyLjgxLS45MjEgMi44MS0yLjE3NHMtMS4xNTUtMi4xNDYtMi44MS0yLjE3M3ptLTYuMTQ0IDMuNjM4Yy0xLjIxLS4wMTItMS45OS0uNTg3LTEuOTktMS40NjVzLjc4LTEuNDUyIDEuOTktMS40NjVjMS4yMS4wMTMgMS45OTEuNTg4IDEuOTkxIDEuNDY1cy0uNzgxIDEuNDUzLTEuOTkgMS40NjV6bS4wMzctMy42MzhoLS4wNzNjLS43ODkuMDEzLTEuNDY0LjIyMi0xLjk1NS41NzR2LS4zN2gtLjg1NnY1LjVoLjg1NnYtMS45MzFjLjQ5MS4zNTEgMS4xNjYuNTYgMS45NTUuNTc0YTMuNzI4IDMuNzI4IDAgMCAwIC4wNzMgMGMxLjY1NS0uMDI3IDIuODExLS45MjEgMi44MTEtMi4xNzRzLTEuMTU2LTIuMTQ2LTIuODEtMi4xNzN6Ii8+Cjwvc3ZnPg==',
  'OnePlus': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5PbmVQbHVzPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAzLjc0VjI0aDIwLjI2VjEyLjQyOGgtMi4yNTZ2OS4zMTdIMi4yNTRWNS45OTVoOS4zMThWMy43NDJ6TTE4LjAwNCAwdjMuNzRoLTMuNzU4djIuMjU2aDMuNzU4djMuNzU4aDIuMjU1VjUuOTk2SDI0VjMuNzRoLTMuNzU4VjB6bS02LjQ1IDE4Ljc1NlY4Ljg2Mkg5LjU2MmMwIC42ODItLjIyOCAxLjE4OS0uNTc3IDEuNTA0LS4zNjcuMjk3LS45MS40MzctMS41NTYuNDM3aC0uMjQ1djEuNjI1aDIuMTMzdjYuMzFoMi4yMzd6Ii8+PC9zdmc+',
  'REDMI': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2OCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDY4IDI0Ij4KICA8cmVjdCB3aWR0aD0iNjgiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz4KICA8dGV4dCB4PSIzNCIgeT0iMTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjE3IiBmaWxsPSIjZmZmIiBsZXR0ZXItc3BhY2luZz0iMiI+UkVETUk8L3RleHQ+Cjwvc3ZnPgo=',
  'RedMagic': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTI1QUQ4OEU0Qjk0MTFFQUEyMzlDRTc4RkE0MTlCOTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTI1QUQ4OEY0Qjk0MTFFQUEyMzlDRTc4RkE0MTlCOTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5MjVBRDg4QzRCOTQxMUVBQTIzOUNFNzhGQTQxOUI5NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5MjVBRDg4RDRCOTQxMUVBQTIzOUNFNzhGQTQxOUI5NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgJNq/0AABOeSURBVHja7F0HeJTV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',
  'Xiaomi': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5YaWFvbWk8L3RpdGxlPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xMiAwQzguMDE2IDAgNC43NTYuMjU1IDIuNDkzIDIuNTE2LjIzIDQuNzc2IDAgOC4wMzMgMCAxMi4wMTJjMCAzLjk4LjIzIDcuMjM1IDIuNDk0IDkuNDk3QzQuNzU3IDIzLjc3IDguMDE3IDI0IDEyIDI0YzMuOTgzIDAgNy4yNDMtLjIzIDkuNTA2LTIuNDkxQzIzLjc3IDE5LjI0NyAyNCAxNS45OSAyNCAxMi4wMTJjMC0zLjk4NC0uMjMzLTcuMjQzLTIuNTAyLTkuNTA0QzE5LjIzNC4yNTIgMTUuOTc4IDAgMTIgMHpNNC45MDYgNy40MDVoNS42MjRjMS40NyAwIDMuMDA3LjA2OCAzLjc2NC44MjcuNzQ2Ljc0Ni44MjcgMi4yMzMuODMgMy42NzZ2NC41NGEuMTUuMTUgMCAwIDEtLjE1Mi4xNDdoLTEuOTQ3YS4xNS4xNSAwIDAgMS0uMTUyLS4xNDhWMTEuODNjLS4wMDItLjgwNi0uMDQ4LTEuNjM0LS40NjQtMi4wNTEtLjM1OC0uMzYtMS4wMjYtLjQ0MS0xLjcyLS40NThINy4xNThhLjE1LjE1IDAgMCAwLS4xNTEuMTQ3djYuOThhLjE1LjE1IDAgMCAxLS4xNTIuMTQ4SDQuOTA2YS4xNS4xNSAwIDAgMS0uMTUtLjE0OFY3LjU1NGEuMTUuMTUgMCAwIDEgLjE1LS4xNDl6bTEyLjEzMSAwaDEuOTQ5YS4xNS4xNSAwIDAgMSAuMTUuMTV2OC44OTJhLjE1LjE1IDAgMCAxLS4xNS4xNDhoLTEuOTQ5YS4xNS4xNSAwIDAgMS0uMTUxLS4xNDhWNy41NTRhLjE1LjE1IDAgMCAxIC4xNTEtLjE0OXpNOC45MiAxMC45NDhoMi4wNDZjLjA4MyAwIC4xNS4wNjYuMTUuMTQ3djUuMzUyYS4xNS4xNSAwIDAgMS0uMTUuMTQ4SDguOTJhLjE1LjE1IDAgMCAxLS4xNTItLjE0OHYtNS4zNTJhLjE1LjE1IDAgMCAxIC4xNTItLjE0N1oiLz48L3N2Zz4=',
  'iQOO': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDY0IDI0Ij4KICA8cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz4KICA8dGV4dCB4PSIzMiIgeT0iMTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjIwIiBmaWxsPSIjMDAwIiBsZXR0ZXItc3BhY2luZz0iMiI+aVFPTzwvdGV4dD4KPC9zdmc+Cg==',
  'realme': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MiIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDcyIDI0Ij4KICA8cmVjdCB3aWR0aD0iNzIiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjZmZmIi8+CiAgPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjI0IiBmaWxsPSJub25lIi8+CiAgPHRleHQgeD0iMzYiIHk9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjcwMCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzAwMCIgbGV0dGVyLXNwYWNpbmc9IjIiPnJlYWxtZTwvdGV4dD4KPC9zdmc+Cg==',
  'Samsung': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDgwIDI0Ij4KICA8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiLz4KICA8dGV4dCB4PSI0MCIgeT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmIiBsZXR0ZXItc3BhY2luZz0iMiI+U0FNU1VORzwvdGV4dD4KPC9zdmc+Cg==',
  'vivo': 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT52aXZvPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTkuNjA0IDE0LjEwMWMtMS4xNTkgMC0xLjI2Mi0uOTUtMS4yNjItMS4yNCAwLS4yOS4xMDMtMS4yNDIgMS4yNjItMS4yNDJoMi4wNjJjMS4xNiAwIDEuMjYzLjk1MSAxLjI2MyAxLjI0MiAwIC4yOS0uMTA0IDEuMjQtMS4yNjMgMS4yNG0tMi4wNjItMy41MjdjLTIuMTQyIDAtMi4zMzMgMS43NTItMi4zMzMgMi4yODcgMCAuNTM1LjE5IDIuMjg2IDIuMzMzIDIuMjg2aDIuMDYyYzIuMTQzIDAgMi4zMzQtMS43NTEgMi4zMzQtMi4yODYgMC0uNTM1LS4xOS0yLjI4Ny0yLjMzNC0yLjI4N20tNS40NzcuMTA3Yy0uMjg2IDAtLjM0NS4wNS0uNDU2LjIxMy0uMTEuMTY0LTIuMDIyIDMuMDgyLTIuMDIyIDMuMDgyLS4wNi4wOS0uMTI2LjEyNi0uMjA2LjEyNi0uMDggMC0uMTQ1LS4wMzYtLjIwNi0uMTI2IDAgMC0xLjkxMi0yLjkxOC0yLjAyMi0zLjA4Mi0uMTEtLjE2NC0uMTctLjIxMy0uNDU2LS4yMTNoLS42NjhjLS4xNTQgMC0uMjI0LjEyLS4xMjcuMjY3bDIuMjgzIDMuNDY3Yy4zNTQuNTIxLjYxNC43MzIgMS4xOTYuNzMycy44NDItLjIxIDEuMTk2LS43MzJsMi4yODQtMy40NjdjLjA5Ni0uMTQ2LjAyNi0uMjY3LS4xMjgtLjI2N20tOC44NzYuMjg0YzAtLjIwMy4wOC0uMjg0LjI4My0uMjg0aC41MDVjLjIwMyAwIC4yODMuMDguMjgzLjI4M3YzLjljMCAuMjAyLS4wOC4yODMtLjI4My4yODNoLS41MDVjLS4yMDMgMC0uMjgzLS4wOC0uMjgzLS4yODN6bS0xLjc2OS0uMjg1Yy0uMjg3IDAtLjM0Ni4wNS0uNDU2LjIxMy0uMTEuMTY0LTIuMDIyIDMuMDgyLTIuMDIyIDMuMDgyLS4wNjEuMDktLjEyNi4xMjYtLjIwNi4xMjYtLjA4IDAtLjE0NS0uMDM2LS4yMDYtLjEyNiAwIDAtMS45MTItMi45MTgtMi4wMjMtMy4wODItLjExLS4xNjQtLjE2OS0uMjEzLS40NTUtLjIxM0guMTc1Yy0uMTcxIDAtLjIyNC4xMi0uMTI3LjI2N2wyLjI4MyAzLjQ2N2MuMzU1LjUyMS42MTUuNzMyIDEuMTk3LjczMi41ODIgMCAuODQyLS4yMSAxLjE5Ni0uNzMybDIuMjgzLTMuNDY3Yy4wOTctLjE0Ni4wNDQtLjI2Ny0uMTI3LS4yNjdtMS4wNTUtLjg5M2MtLjE2NS0uMTY0LS4xNjUtLjI5NSAwLS40NmwuMzUxLS4zNTFjLjE2NS0uMTY1LjI5Ni0uMTY1LjQ2IDBsLjM1Mi4zNTFjLjE2NS4xNjUuMTY1LjI5NiAwIC40NmwtLjM1Mi4zNTJjLS4xNjQuMTY1LS4yOTUuMTY1LS40NiAweiIvPjwvc3ZnPg==',
}

// ===== Helper functions =====
export function normDate(d) {
  if (!d) return ''
  if (d.length === 7) return d + '-01'
  return d
}

export function getSeriesName(model) {
  let s = model.trim()
  s = s.replace(/ (RS 非凡大师|RSR保时捷|风驰版|徕卡版|至尊版|元气版|保时捷设计|保时捷)$/, '')
  s = s.replace(/ 优享版$/, '')
  s = s.replace(/ \(\\d+GB\)$/, '')
  const engSuffixes = [
    ' Pro Max', ' Pro mini', ' Pro+', ' Ultra', ' Pro',
    ' Plus', ' Max', ' Mini', ' Lite', ' SE', ' FE', ' Note', ' Turbo'
  ]
  for (const suff of engSuffixes) {
    if (s.endsWith(suff)) { s = s.slice(0, -suff.length).trim(); break }
  }
  while (/[0-9][zTs+c]$/.test(s)) s = s.slice(0, -1)
  return s.trim()
}

export function simplifyCapacity(s) {
  if (!s) return ''
  const m = s.match(/(\d+GB(?:\s*\/\s*\d+GB)?)/)
  return m ? m[1] : s
}

export function getEnglishBrand(zh) {
  const map = { "苹果": "Apple", "三星": "Samsung", "摩托罗拉": "Motorola" }
  return map[zh] || zh
}

export function getDisplayName(p) {
  const m = p.model, b = p.brand
  if (m.toLowerCase().startsWith(b.toLowerCase())) return m
  if (m.startsWith('iPhone') || m.startsWith('Galaxy') || m.startsWith('moto') || m.startsWith('Moto')) return m
  if (/^[\u4e00-\u9fff]/.test(m)) {
    const stripped = m.replace(/^[\u4e00-\u9fff\s]+/, '')
    return b + (stripped ? ' ' + stripped : '')
  }
  if (b === 'OPPO' || b === 'REDMI') return m
  return b + ' ' + m
}

export function getFoldableScreenDisplay(phone) {
  if (phone.screen_unfolded && phone.screen_folded) {
    const unfolded = phone.screen_unfolded
    const folded = phone.screen_folded
    const foldType = phone.fold_type || '折叠屏'
    if (foldType === '三折叠') return `三折叠 ${unfolded.size}英寸/${folded.size}英寸`
    if (foldType === '横向折叠') return `横折 ${unfolded.size}英寸/${folded.size}英寸`
    if (foldType === '纵向折叠') return `竖折 ${unfolded.size}英寸/${folded.size}英寸`
    return `${unfolded.size}英寸/${folded.size}英寸`
  }
  return (phone.screen_size ? phone.screen_size + '英寸' : '') + (phone.screen_type ? ' ' + phone.screen_type : '') || '—'
}

export function getFoldableResolutionDisplay(phone) {
  if (phone.screen_unfolded && phone.screen_folded) {
    return `${phone.screen_unfolded.resolution || '—'} / ${phone.screen_folded.resolution || '—'}`
  }
  return phone.resolution || '—'
}

export function getFoldableRefreshDisplay(phone) {
  if (phone.screen_unfolded && phone.screen_folded) {
    return `${phone.screen_unfolded.refresh_hz || '—'}Hz / ${phone.screen_folded.refresh_hz || '—'}Hz`
  }
  return phone.refresh_hz ? phone.refresh_hz + 'Hz' : '—'
}

export function getCameraSpecs(p) {
  const dc = p.detailed_camera || ''
  const cd = p.camera_desc || ''
  const specs = []

  function fmtMp(num) {
    const n = parseInt(num)
    if (!n) return ''
    return n >= 100 ? n + '万' : n + 'MP'
  }

  function cleanCamTxt(txt) {
    return txt
      .replace(/徕卡[\w]*/g, '')
      .replace(/哈苏[\w]*/g, '')
      .replace(/蔡司[\w]*/g, '')
      .replace(/大底/g, '')
      .replace(/浮动/g, '')
      .replace(/超动态鹰眼/g, '')
      .replace(/像素/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function extractBrief(s) {
    s = cleanCamTxt(s)
    let mp = (s.match(/(\d+)\s*[万M]/) || [])[1] || ''
    let cmos = (s.match(/[\u4e00-\u9fff]*?(LYT[-\w]+|IMX\w+|HP\d|OV\w+|索尼\w*|三星\w*|光影猎人\w*)/) || [])[1] || ''
    let aperture = (s.match(/[fF]\s*\/?\s*[\d.]+/) || [])[0] || ''
    if (aperture) { aperture = aperture.replace(/^F\s*/i, 'f/'); aperture = aperture.replace(/^f\/\//, 'f/') }
    let parts = []
    if (mp) parts.push(fmtMp(mp))
    if (cmos) parts.push(cmos)
    if (aperture) parts.push(aperture)
    return parts.join(' ') || s.substring(0, 20)
  }

  if (dc && dc.length > 5) {
    const sections = dc.split('|').map(s => s.trim()).filter(Boolean)
    let rearCams = []
    let frontTxt = ''

    for (const sec of sections) {
      const clean = sec.replace(/^[^：:]*[：:]\s*/, '').trim()
      if (/^前置/.test(sec)) { frontTxt = extractBrief(clean); continue }
      if (/^后置/.test(sec)) {
        const subs = clean.split('+').map(x => x.trim()).filter(Boolean)
        for (const sub of subs) {
          let t = ''
          if (/主摄/.test(sub)) t = '主'
          else if (/超广角/.test(sub)) t = '广'
          else if (/长焦/.test(sub) || /潜望/.test(sub)) t = sub.includes('超长焦') ? '超长' : '长'
          else if (/微距/.test(sub)) t = '微'
          else t = '镜'
          const subClean = sub.replace(/(主摄|超广角|潜望长焦|潜望|长焦|超长焦|微距|黑白)/g, '').trim()
          const brief = extractBrief(subClean)
          if (brief) rearCams.push({t, d: brief})
        }
        continue
      }
      let type = ''
      if (/主摄/.test(sec)) type = '主'
      else if (/超广角/.test(sec)) type = '广'
      else if (/长焦/.test(sec) || /潜望/.test(sec)) type = sec.includes('超长焦') ? '超长' : '长'
      if (type) rearCams.push({t: type, d: extractBrief(clean)})
    }

    if (rearCams.length === 0 && frontTxt === '') {
      for (const sec of sections) {
        const cs = sec.replace(/^[^：:]*[：:]\s*/, '').trim()
        if (/前置/.test(sec)) frontTxt = extractBrief(cs)
        else if (/主摄/.test(sec)) rearCams.push({t:'主', d: extractBrief(cs)})
        else if (/超广角/.test(sec)) rearCams.push({t:'广', d: extractBrief(cs)})
        else if (/长焦/.test(sec) || /潜望/.test(sec)) rearCams.push({t:'长', d: extractBrief(cs)})
      }
    }

    const camLabelMap = { '主': '主摄', '广': '超广', '长': '长焦', '超长': '超长焦', '微': '微距', '镜': '其他' }
    const camOrder = { '广': 0, '主': 1, '长': 2, '超长': 3, '微': 4, '镜': 5 }
    rearCams.sort((a, b) => (camOrder[a.t] ?? 99) - (camOrder[b.t] ?? 99))
    if (rearCams.length > 0) {
      const rearLines = rearCams.map(c => camLabelMap[c.t] + ' ' + c.d)
      specs.push({ l: '后置', v: rearLines.join('\n'), colspan: true })
    }
    if (frontTxt) {
      specs.push({ l: '前置', v: frontTxt })
    }
  } else if (cd) {
    const brief = cd.replace(/\|/g, ' · ').trim().substring(0, 25)
    if (brief) specs.push({ l: '影像', v: brief })
  }
  return specs
}
