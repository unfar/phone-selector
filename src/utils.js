// ===== 配置数据 =====
export const cpuTags = ["骁龙8 Elite 5","骁龙8 Elite 1","骁龙8 Gen5","天玑9500","天玑8500","麒麟9030","麒麟9020","天玑9400","麒麟9010s","A19","A18"]

export const featureTags = ["潜望长焦","6500mAh+","≤200g","防尘抗水","NFC","红外","USB3.0","无线充电","散热风扇","有线投屏"]

// 充电协议筛选（来自充电头网实测 charge_protocols 字段）
export const protocolTags = ["5A PPS","UFCS","PPS","PD","QC","SCP","FCP","VFCP","Qi"]

export const screenSizeRanges = [
  { name: "6英寸左右", min: 5.7, max: 6.3 },
  { name: "6.5英寸左右", min: 6.2, max: 6.8 },
  { name: "7英寸左右", min: 6.7, max: 7.5 }
]

export const screenTypes = ['📱 直屏','🔄 折叠屏']

export const textLogoBrands = new Set(['Samsung','OPPO','REDMI','iQOO','HONOR','vivo','realme'])

export const largeLogoBrands = new Set(['OPPO','vivo','RedMagic'])

export function getLogoStyle(brand) {
  return 'height:22px;width:auto'
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
  'RedMagic': 'data:image/png;base64,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',
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

/**
 * 从 features 提取 IP 防尘抗水等级。
 * 兼容两种历史写法：
 *  - 原始码: "IP68", "IP69K", "IP5X", "IPX8"
 *  - 拆分标注: "防尘: IP6X", "防水: IPX8"
 * 返回去重后的等级数组，如 ["IP66","IP68","IP69K"]
 */
export function getIpLevels(phone) {
  const feats = phone?.features || []
  const levels = []
  for (const f of feats) {
    if (typeof f !== 'string') continue
    // 匹配 IP68 / IP69K / IP5X / IPX8 / IPX9 等
    const matches = f.match(/IP(?:\d{1,2}X?K?|X\d{1,2}K?)/gi)
    if (matches) {
      for (const m of matches) levels.push(m.toUpperCase())
    }
  }
  return [...new Set(levels)]
}

/** 卡片/对比用：返回展示字符串，无数据时回退 tags「防尘抗水」→「支持」 */
export function getIpRating(phone, { join = ' ', empty = '—', supportFallback = true } = {}) {
  const levels = getIpLevels(phone)
  if (levels.length > 0) return levels.join(join)
  if (supportFallback && phone?.tags?.includes('防尘抗水')) return '支持'
  return empty
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

/** 解析单段镜头文本，尽量抽出像素/传感器/CMOS/光圈/焦距/变焦/OIS/品牌 */
function parseCameraSegment(raw) {
  const text = String(raw || '').replace(/\s+/g, ' ').trim()
  if (!text) return null

  // 像素：优先 亿/万/MP
  let mp = ''
  let m
  if ((m = text.match(/(\d+(?:\.\d+)?)\s*亿/))) {
    const yi = parseFloat(m[1])
    mp = Number.isInteger(yi) ? `${yi}亿` : `${yi}亿`
  } else if ((m = text.match(/(\d+)\s*万(?:像素)?/))) {
    const wan = parseInt(m[1], 10)
    // 10000万 = 1亿；>=10000 万 转亿
    mp = wan >= 10000 ? `${wan / 10000}亿` : `${wan}万`
  } else if ((m = text.match(/(\d+)\s*MP/i))) {
    const n = parseInt(m[1], 10)
    // 200MP ≈ 2亿；50MP 保持 50MP
    mp = n >= 100 ? `${n / 100}亿` : `${n}MP`
  }

  // 传感器代号
  let sensor = ''
  if ((m = text.match(/(LYT-?\d+[A-Z]?|IMX\d+[A-Z]?|OV\d+[A-Z]?|HP[A-Z0-9]+|GN\d+|JN\d+|SC\d+XS?|光影猎人\d*)/i))) {
    sensor = m[1].replace(/LYT(?!-)/i, 'LYT-')
  }

  // 传感器品牌线索（无具体代号时，注意 RYYB/XMAGE 不是型号）
  let brand = ''
  if (/索尼|Sony/i.test(text)) brand = '索尼'
  else if (/三星|Samsung/i.test(text)) brand = '三星'
  else if (/豪威|OmniVision|OV/i.test(text) && !sensor) brand = '豪威'
  else if (/思特威|SmartSens/i.test(text)) brand = '思特威'
  // 不再把 RYYB/XMAGE 拼进 brand

  // CMOS 尺寸
  let size = ''
  if ((m = text.match(/\b1["”]/))) size = '1"'
  else if ((m = text.match(/(1\/\d+(?:\.\d+)?)["”]?/))) size = m[1] + (/"/.test(m[0]) || /”/.test(m[0]) ? '"' : '"')
  // normalize 1/1.3" style
  size = size.replace(/”/g, '"')
  if (size && !size.endsWith('"') && /^1\//.test(size)) size += '"'

  // 光圈（支持可变 f/1.4-4.0）
  let aperture = ''
  if ((m = text.match(/f\s*\/?\s*(\d+(?:\.\d+)?)\s*[-~～到至]\s*f?\s*\/?\s*(\d+(?:\.\d+)?)/i))) {
    aperture = `f/${m[1]}-${m[2]}`
  } else if ((m = text.match(/[fF]\s*\/?\s*(\d+(?:\.\d+)?)/))) {
    aperture = `f/${m[1]}`
  }

  // 焦距 mm
  let focal = ''
  if ((m = text.match(/(\d{2,3})\s*mm/i))) focal = m[1] + 'mm'

  // 光学变焦（排除传感器尾号：SC585XS 不会误识别 585x；只匹配常见 2x~120x）
  let zoom = ''
  if ((m = text.match(/(\d+(?:\.\d+)?)\s*[xX×]/))) {
    const zv = parseFloat(m[1])
    if (zv <= 120) zoom = m[1] + 'x'
  } else if ((m = text.match(/\b(\d+(?:\.\d+)?)\s*[xX×]/))) {
    const zv = parseFloat(m[1])
    if (zv >= 1 && zv <= 120) zoom = m[1] + 'x'
  }

  // 视场角
  let fov = ''
  if ((m = text.match(/(\d{2,3})\s*°/))) fov = m[1] + '°'

  // 光学技术 / 滤镜 / 品牌名称（不是传感器型号，单独展示）
  let optics = ''
  if (/RYYB/i.test(text)) optics = (optics ? optics + '/' : '') + 'RYYB'
  if (/XMAGE/i.test(text)) optics = (optics ? optics + '/' : '') + 'XMAGE'

  const ois = /OIS|光学防抖|传感器位移/.test(text)
  const brandTune = []
  if (/徕卡|Leica/i.test(text)) brandTune.push('徕卡')
  if (/蔡司|Zeiss/i.test(text)) brandTune.push('蔡司')
  if (/哈苏|Hasselblad/i.test(text)) brandTune.push('哈苏')
  if (/理光|RICOH|GR/i.test(text)) brandTune.push('理光')

  // 摘要行
  const summaryParts = []
  if (mp) summaryParts.push(mp)
  if (sensor) summaryParts.push(sensor)
  else if (brand) summaryParts.push(brand)
  if (size) summaryParts.push(size)
  if (aperture) summaryParts.push(aperture)
  if (focal) summaryParts.push(focal)
  if (zoom) summaryParts.push(zoom)
  if (fov && !focal) summaryParts.push(fov)
  if (ois) summaryParts.push('OIS')
  if (optics) summaryParts.push(optics)
  if (brandTune.length) summaryParts.push(brandTune.join('/'))

  const chips = []
  if (mp) chips.push({ k: '像素', v: mp })
  if (sensor || brand) chips.push({ k: '传感器型号', v: sensor || brand })
  if (size) chips.push({ k: '传感器尺寸', v: size })
  if (aperture) chips.push({ k: '光圈', v: aperture })
  if (focal) chips.push({ k: '焦距', v: focal })
  if (zoom) chips.push({ k: '变焦', v: zoom })
  if (fov) chips.push({ k: '视角', v: fov })
  if (ois) chips.push({ k: '防抖', v: 'OIS' })
  if (optics) chips.push({ k: '光学技术', v: optics })
  if (brandTune.length) chips.push({ k: '调校', v: brandTune.join('/') })

  return {
    mp, sensor, brand, size, aperture, focal, zoom, fov, ois,
    brandTune,
    summary: summaryParts.join(' · ') || text.slice(0, 36),
    chips,
    raw: text,
  }
}

function detectCameraRole(sec) {
  const s = String(sec || '')
  if (/前置|内屏前置|外屏前置|selfie/i.test(s)) {
    if (/内屏/.test(s)) return { key: 'front_inner', label: '内屏前置', group: 'front' }
    if (/外屏/.test(s)) return { key: 'front_outer', label: '外屏前置', group: 'front' }
    return { key: 'front', label: '前置', group: 'front' }
  }
  if (/超长焦/.test(s)) return { key: 'super_tele', label: '超长焦', group: 'rear' }
  if (/潜望/.test(s)) return { key: 'periscope', label: '潜望长焦', group: 'rear' }
  if (/长焦|tele/i.test(s)) return { key: 'tele', label: '长焦', group: 'rear' }
  if (/超广|超广角|ultrawide/i.test(s)) return { key: 'uw', label: '超广角', group: 'rear' }
  if (/微距|macro/i.test(s)) return { key: 'macro', label: '微距', group: 'rear' }
  if (/主摄|广角|后置|wide/i.test(s)) return { key: 'main', label: '主摄', group: 'rear' }
  return { key: 'other', label: '镜头', group: 'rear' }
}

/**
 * 结构化影像模块：供详情页卡片 / 列表摘要 / 对比页使用
 * @returns {{ modules: Array, rear: Array, front: Array, summary: string, lines: string[] }}
 */
export function getCameraModules(p) {
  const dc = p?.detailed_camera || ''
  const cd = p?.camera_desc || ''
  const modules = []

  if (dc && dc.length > 3) {
    const sections = dc.split('|').map(s => s.trim()).filter(Boolean)
    for (const sec of sections) {
      // 兼容 “后置: A + B + C”
      if (/^后置/.test(sec) && sec.includes('+')) {
        const body = sec.replace(/^[^：:]*[：:]\s*/, '')
        for (const sub of body.split('+').map(x => x.trim()).filter(Boolean)) {
          const role = detectCameraRole(sub)
          const parsed = parseCameraSegment(sub)
          if (parsed) modules.push({ ...role, ...parsed })
        }
        continue
      }
      const role = detectCameraRole(sec)
      const body = sec.replace(/^[^：:]*[：:]\s*/, '').trim() || sec
      // 双前置 "60MP超广角+8MP人像"
      if (role.group === 'front' && body.includes('+') && /MP|万|亿/.test(body)) {
        const parts = body.split('+').map(x => x.trim()).filter(Boolean)
        if (parts.length >= 2) {
          parts.forEach((part, idx) => {
            const parsed = parseCameraSegment(part)
            if (parsed) {
              modules.push({
                key: idx === 0 ? 'front' : 'front_aux',
                label: idx === 0 ? '前置' : '前置副摄',
                group: 'front',
                ...parsed,
              })
            }
          })
          continue
        }
      }
      const parsed = parseCameraSegment(body)
      if (parsed) modules.push({ ...role, ...parsed })
    }
  } else if (cd) {
    // 退化：从 camera_desc 拆
    for (const sec of cd.split('|').map(s => s.trim()).filter(Boolean)) {
      const role = detectCameraRole(sec)
      const parsed = parseCameraSegment(sec)
      if (parsed) modules.push({ ...role, ...parsed })
    }
  }

  // 去重（同 role+summary）
  const seen = new Set()
  const uniq = []
  for (const m of modules) {
    const k = m.key + '|' + m.summary
    if (seen.has(k)) continue
    seen.add(k)
    uniq.push(m)
  }

  const order = { main: 0, uw: 1, tele: 2, periscope: 3, super_tele: 4, macro: 5, other: 6, front: 10, front_inner: 11, front_outer: 12, front_aux: 13 }
  uniq.sort((a, b) => (order[a.key] ?? 50) - (order[b.key] ?? 50))

  const rear = uniq.filter(m => m.group === 'rear')
  const front = uniq.filter(m => m.group === 'front')
  const lines = uniq.map(m => `${m.label} ${m.summary}`)
  const summary = rear[0]?.summary || uniq[0]?.summary || cd || '—'

  return { modules: uniq, rear, front, summary, lines }
}

export function getCameraSpecs(p) {
  const { rear, front, lines, summary } = getCameraModules(p)
  const specs = []
  if (rear.length) {
    specs.push({
      l: '后置',
      v: rear.map(m => `${m.label} ${m.summary}`).join('\n'),
      colspan: true,
      modules: rear,
    })
  }
  if (front.length) {
    specs.push({
      l: '前置',
      v: front.map(m => front.length > 1 ? `${m.label} ${m.summary}` : m.summary).join('\n'),
      modules: front,
    })
  }
  if (!specs.length && summary && summary !== '—') {
    specs.push({ l: '影像', v: summary })
  }
  // 附加完整行，详情页可用
  if (lines.length) specs._lines = lines
  return specs
}
