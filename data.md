# Hawkins App - Build Instructions

### Option 1: Command Line (Fastest)
If you want to build the APK directly from your terminal:
1. Ensure you have the Android SDK and Java 21 installed.
2. Run the following command:
   ```bash
   cd android
   ./gradlew.bat assembleDebug
   ```
3. Once finished, your APK will be located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Android Studio (GUI)
1. Ensure you have Android Studio installed on your PC.
2. In your terminal, run:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```
3. Android Studio will automatically open up with your project.
4. Let it load entirely (click "Sync Now" if prompted), then click **Build** in the top menu -> **Build Bundle / APK** -> **Build APK(s)**.
5. In the bottom right corner, click **"Locate"**.
6. Copy the newly generated `app-debug.apk` file to your phone and install it!

---

Section: Hawkins Classic
| Product Name                   | Product Code | MRP (₹) | Case Pack |
| ------------------------------ | ------------ | ------- | --------- |
| 1.5 Litre Classic Cooker       | CL 15        | 1175    | 12        |
| 1.5 Litre Classic Cooker       | ICL 15       | 1350    | 12        |
| 2 Litre Classic Cooker         | CL 20        | 1350    | 12        |
| 2 Litre Classic Cooker (Tall)  | ICL 2T       | 1475    | 9         |
| 3 Litre Classic Cooker         | CL 3T        | 1575    | 9         |
| 3 Litre Classic Cooker (Tall)  | ICL 3T       | 1725    | 9         |
| 3 Litre Classic Cooker (Wide)  | CL 3W        | 1650    | 9         |
| 3 Litre Classic Cooker (Wide+) | ICL 3W       | 1750    | 9         |
| 3.5 Litre Classic Cooker       | CL 35        | 1725    | 6         |
| 4 Litre Classic Cooker         | CL 40        | 1900    | 6         |
| 4 Litre Classic Cooker (Tall)  | ICL 40       | 1975    | 6         |
| 5 Litre Classic Cooker         | CL 50        | 2150    | 6         |
| 5 Litre Classic Cooker (Tall)  | ICL 50       | 2325    | 6         |
| 6.5 Litre Classic Cooker       | CL 65        | 2375    | 6         |
| 8 Litre Classic Cooker         | CL 8T        | 2575    | 4         |
| 8 Litre Classic Cooker (Wide)  | CL 8W        | 2650    | 4         |
| 10 Litre Classic Cooker        | CL 10        | 3000    | 4         |
| 12 Litre Classic Cooker        | CL 12        | 3500    | 2         |

Section: Hawkins White Contura
| Product Name            | Product Code | MRP (₹) | Case Pack |
| ----------------------- | ------------ | ------- | --------- |
| 1.5 Litre White Contura | HC 15        | 1200    | 12        |
| 2 Litre White Contura   | HC 20        | 1450    | 9         |
| 3 Litre White Contura   | HC 30        | 1675    | 9         |
| 3.5 Litre White Contura | HC 35        | 1875    | 8         |
| 4 Litre White Contura   | HC 40        | 1975    | 6         |
| 5 Litre White Contura   | HC 50        | 2275    | 6         |
| 6.5 Litre White Contura | HC 65        | 2525    | 4         |

Section: Hawkins Black Contura
| Product Name            | Product Code | MRP (₹) | Case Pack |
| ----------------------- | ------------ | ------- | --------- |
| 1.5 Litre Black Contura | CB 15        | 1675    | 12        |
| 2 Litre Black Contura   | CB 20        | 2000    | 9         |
| 3 Litre Black Contura   | CB 30        | 2300    | 9         |
| 3.5 Litre Black Contura | CB 35        | 2500    | 8         |
| 4 Litre Black Contura   | CB 40        | 2675    | 6         |
| 5 Litre Black Contura   | CB 50        | 3175    | 6         |
| 6.5 Litre Black Contura | CB 65        | 3450    | 4         |


Section: Hawkins Black Contura Induction
| Product Name                      | Product Code | MRP (₹) | Case Pack |
| --------------------------------- | ------------ | ------- | --------- |
| 1.5 Litre Black Contura Induction | CXT 15       | 1925    | 9         |
| 2 Litre Black Contura Induction   | CXT 20       | 2300    | 9         |
| 3 Litre Black Contura Induction   | CXT 30       | 2625    | 8         |
| 3.5 Litre Black Contura Induction | CXT 35       | 2950    | 6         |
| 5 Litre Black Contura Induction   | CXT 50       | 3625    | 4         |
| 6.5 Litre Black Contura Induction | CXT 65       | 3925    | 4         |

Section: Hawkins Stainless Steel Contura
| Product Name                      | Product Code | MRP (₹) | Case Pack |
| --------------------------------- | ------------ | ------- | --------- |
| 1.5 Litre Stainless Steel Contura | SSC 15       | 2300    | 9         |
| 2 Litre Stainless Steel Contura   | SSC 20       | 2625    | 6         |
| 3 Litre Stainless Steel Contura   | SSC 30       | 3050    | 6         |
| 3.5 Litre Stainless Steel Contura | SSC 35       | 3275    | 6         |
| 5 Litre Stainless Steel Contura   | SSC 50       | 3675    | 4         |

Section: Hawkins Stainless Steel Classic
| Product Name                           | Product Code | MRP (₹) | Case Pack |
| -------------------------------------- | ------------ | ------- | --------- |
| 1.5 Litre Stainless Steel Classic      | HSS 15       | 2150    | 9         |
| 2 Litre Stainless Steel Classic        | HSS 20       | 2475    | 8         |
| 3 Litre Stainless Steel Classic (Tall) | HSS 3T       | 2900    | 6         |
| 3 Litre Stainless Steel Classic (Wide) | HSS 3W       | 3025    | 6         |
| 4 Litre Stainless Steel Classic        | HSS 40       | 3275    | 4         |
| 5 Litre Stainless Steel Classic        | HSS 50       | 3550    | 4         |
| 6 Litre Stainless Steel Classic        | HSS 60       | 3900    | 4         |
| 8 Litre Stainless Steel Classic (Wide) | HSS 80       | 5200    | 4         |
| 10 Litre Stainless Steel Classic       | HSS 10       | 5625    | 2         |

Section: Hawkins Stainless Steel Hevibase
| Product Name                            | Product Code | MRP (₹) | Case Pack |
| --------------------------------------- | ------------ | ------- | --------- |
| 2 Litre Stainless Steel Hevibase        | HSI 20       | 2625    | 8         |
| 3 Litre Stainless Steel Hevibase (Tall) | HSI 3T       | 3100    | 6         |

Section: Hawkins Classic HeviBase
| Product Name                    | Product Code | MRP (₹) | Case Pack |
| ------------------------------- | ------------ | ------- | --------- |
| 2 Litre Classic HeviBase        | IH 20        | 1700    | 9         |
| 3 Litre Classic HeviBase        | IH 30        | 2025    | 6         |
| 3.5 Litre Classic HeviBase      | IH 35        | 2250    | 6         |
| 5 Litre Classic HeviBase        | IH 50        | 2675    | 6         |
| 6.5 Litre Classic HeviBase      | IH 65        | 2900    | 4         |
| 8 Litre Classic HeviBase (Wide) | IH 80        | 3425    | 4         |

Section: Hawkins Tri-Ply Stainless Steel
Sub- Section A: Tri-Ply Classic
| Product Name                   | Product Code | MRP (₹) | Case Pack |
| ------------------------------ | ------------ | ------- | --------- |
| 2 Litre Tri-Ply Classic        | SSTCL 20     | 2650    | 6         |
| 3 Litre Tri-Ply Classic (Tall) | SSTCL 3T     | 3050    | 6         |
| 4 Litre Tri-Ply Classic        | SSTCL 40     | 3650    | 4         |
| 5 Litre Tri-Ply Classic        | SSTCL 50     | 3950    | 4         |

Sub- Section B: Tri-Ply With 2 Stainless Steel Separators
| Product Name                             | Product Code | MRP (₹) | Case Pack |
| ---------------------------------------- | ------------ | ------- | --------- |
| 5 Litre Tri-Ply Classic (With Separator) | SSTCL 51     | 4400    | 4         |

Sub- Section C: Tri-Ply Pressure Cooker Cum Pan
| Product Name                   | Product Code | MRP (₹) | Case Pack |
| ------------------------------ | ------------ | ------- | --------- |
| 3 Litre Tri-Ply Cooker Cum Pan | SSTP3P       | 3200    | 6         |

Sub- Section D:  Hawkins Tri-Ply (Regular Series)
| Product Name           | Product Code | MRP (₹) | Case Pack |
| ---------------------- | ------------ | ------- | --------- |
| 1.5 Litre Tri-Ply      | HSST 15      | 2550    | 9         |
| 2.5 Litre Tri-Ply      | HSST 25      | 3025    | 6         |
| 3.5 Litre Tri-Ply      | HSST 35      | 3475    | 6         |
| 4.5 Litre Tri-Ply      | HSST 45      | 4025    | 4         |
| 7 Litre Tri-Ply (Wide) | HSST 7W      | 4725    | 4         |

Sub- Section E: Tri-Ply Contura
| Product Name              | Product Code | MRP (₹) | Case Pack |
| ------------------------- | ------------ | ------- | --------- |
| 1.5 Litre Tri-Ply Contura | SSTCO 15     | 2600    | 9         |
| 3.5 Litre Tri-Ply Contura | SSTCO 35     | 3600    | 6         |
| 5 Litre Tri-Ply Contura   | SSTCO 50     | 4225    | 4         |

Section: Hawkins Futura
Sub- Section A: Hard Anodised
| Product Name                         | Product Code | MRP (₹) | Case Pack |
| ------------------------------------ | ------------ | ------- | --------- |
| 2 Litre Hard Anodised Futura         | FP 20        | 3325    | 6         |
| 2 Litre Hard Anodised Futura         | IFP 20       | 3450    | 8         |
| 3 Litre Hard Anodised Futura         | FP 30        | 3725    | 6         |
| 3 Litre Hard Anodised Futura         | IFP 30       | 3850    | 6         |
| 4 Litre Hard Anodised Futura         | FP 40        | 4325    | 4         |
| 4 Litre Hard Anodised Futura         | IFP 40       | 4500    | 4         |
| 5 Litre Hard Anodised Futura         | FP 50        | 4550    | 4         |
| 5 Litre Hard Anodised Futura         | IFP 50       | 4725    | 4         |
| 6 Litre Hard Anodised Futura         | FP 60        | 4875    | 4         |
| 6 Litre Hard Anodised Futura         | IFP 60       | 5075    | 4         |
| 7 Litre Hard Anodised Futura (Tall)  | FP 7T        | 5250    | 2         |
| 7 Litre Hard Anodised Futura (Jumbo) | FP 7J        | 5300    | 2         |
| 9 Litre Hard Anodised Futura         | FP 90        | 6150    | 2         |

Sub- Section B: Stainless Steel
| Product Name                     | Product Code | MRP (₹) | Case Pack |
| -------------------------------- | ------------ | ------- | --------- |
| 4 Litre Stainless Steel Futura   | FSS 40       | 4875    | 4         |
| 5.5 Litre Stainless Steel Futura | FSS 55       | 5450    | 4         |

Section: Hawkins BigBoy Classic
| Product Name            | Product Code | MRP (₹) | Case Pack |
| ----------------------- | ------------ | ------- | --------- |
| 14 Litre BigBoy Classic | BB 14        | 4300    | 3         |
| 18 Litre BigBoy Classic | BB 18        | 6900    | 2         |
| 22 Litre BigBoy Classic | BB 22        | 7800    | 2         |

Section: Hawkins MissMary Classic
| Product Name                      | Product Code | MRP (₹) | Case Pack |
| --------------------------------- | ------------ | ------- | --------- |
| 1.5 Litre MissMary                | MM 15        | 1050    | 12        |
| 2 Litre MissMary                  | MM 20        | 1150    | 9         |
| 2.5 Litre MissMary                | MM 25        | 1225    | 12        |
| 3 Litre MissMary                  | MM 30        | 1325    | 9         |
| 3 Litre MissMary Induction (Tall) | IMM 3T       | 1400    | 9         |
| 3 Litre MissMary Induction (Wide) | IMM 3W       | 1450    | 9         |
| 3.5 Litre MissMary                | MM 35        | 1375    | 6         |
| 4 Litre MissMary                  | MM 40        | 1575    | 6         |
| 5 Litre MissMary                  | MM 50        | 1725    | 6         |
| 5 Litre MissMary Induction        | IMM 50       | 1825    | 6         |
| 6 Litre MissMary                  | MM 60        | 1875    | 4         |
| 7 Litre MissMary                  | MM 70        | 2100    | 4         |
| 8.5 Litre MissMary                | MM 85        | 2300    | 4         |

Section: Hawkins MissMary Handi
| Product Name           | Product Code | MRP (₹) | Case Pack |
| ---------------------- | ------------ | ------- | --------- |
| 2 Litre MissMary Handi | MMH 20       | 1250    | 9         |
| 3 Litre MissMary Handi | MMH 30       | 1425    | 9         |
| 5 Litre MissMary Handi | MMH 50       | 1825    | 6         |

Section: Hawkins Quik Stainless Steel
| Product Name                 | Product Code | MRP (₹) | Case Pack |
| ---------------------------- | ------------ | ------- | --------- |
| 5 Litre Quik Stainless Steel | QSP 50       | 2600    | 6         |

Section: Hawkins Pro Tri-Ply Stainless Steel
Sub-Section A: Frying Pan
| Product Name                      | Product Code | MRP (₹) | Case Pack |
| --------------------------------- | ------------ | ------- | --------- |
| 18 cm Frying Pan (Without Lid)    | PSF 18       | 1325    | 8         |
| 18 cm Frying Pan (With Steel Lid) | PSF 18S      | 1725    | 8         |
| 22 cm Frying Pan (Without Lid)    | PSF 22       | 1690    | 6         |
| 22 cm Frying Pan (With Steel Lid) | PSF 22S      | 2095    | 6         |
| 26 cm Frying Pan (Without Lid)    | PSF 26       | 2250    | 4         |
| 26 cm Frying Pan (With Steel Lid) | PSF 26S      | 2725    | 4         |


Sub-Section B: Handi
| Product Name                   | Product Code | MRP (₹) | Case Pack |
| ------------------------------ | ------------ | ------- | --------- |
| 2 Litre Handi (With Steel Lid) | PSH 20S      | 2295    | 6         |
| 3 Litre Handi (With Steel Lid) | PSH 30S      | 2575    | 6         |


Sub-Section C: Sauce Pan
| Product Name                        | Product Code | MRP (₹) | Case Pack |
| ----------------------------------- | ------------ | ------- | --------- |
| 1.5 Litre Saucepan (With Steel Lid) | PSSP 15S     | 1835    | 6         |
| 2.5 Litre Saucepan (With Steel Lid) | PSSP 25S     | 2075    | 6         |


Sub-Section D: Milk Pan
| Product Name                        | Product Code | MRP (₹) | Case Pack |
| ----------------------------------- | ------------ | ------- | --------- |
| 3 Litre Milk Pan (With Steel Lid)   | PSMP 30S     | 2625    | 6         |

Sub-Section E: Cook n Serve Bowl
| Product Name                        | Product Code | MRP (₹) | Case Pack |
| ----------------------------------- | ------------ | ------- | --------- |
| 3 Litre Cook n Serve Bowl (With Lid)  | PSC 30S      | 2625    | 6       |

Sub-Section F: Deep Fry Pan
| Product Name                            | Product Code | MRP (₹) | Case Pack |
| --------------------------------------- | ------------ | ------- | --------- |
| 1.5 Litre Deep Fry Pan (With Steel Lid) | PSK 15S      | 2100    | 10        |
| 2.5 Litre Deep Fry Pan (With Steel Lid) | PSK 25S      | 2525    | 6         |
| 3.5 Litre Deep Fry Pan (With Steel Lid) | PSK 35S      | 2825    | 4         |
| 5 Litre Deep Fry Pan (With Steel Lid)   | PSK 50S      | 3275    | 4         |
| 6 Litre Deep Fry Pan (With Steel Lid)   | PSK 60S      | 3600    | 4         |
| 8 Litre Deep Fry Pan (With Steel Lid)   | PSK 80S      | 4075    | 4         |


Section: Hawkins Tri-Ply Stainless Steel HoneyComb
Sub-Section A: Paratha Tava
| Product Name       | Product Code | MRP (₹) | Case Pack |
| ------------------ | ------------ | ------- | --------- |
| 24 cm Paratha Tava | NSPT 24      | 1650    | 12        |
| 26 cm Paratha Tava | NSPT 26      | 1750    | 12        |

Sub-Section B: Dosa Tava
| Product Name    | Product Code | MRP (₹) | Case Pack |
| --------------- | ------------ | ------- | --------- |
| 28 cm Dosa Tava | NSDT 28      | 1875    | 8         |
| 30 cm Dosa Tava | NSDT 30      | 2100    | 6         |

Sub-Section C: Appachatti / Deep Kadhai
| Product Name                           | Product Code | MRP (₹) | Case Pack |
| -------------------------------------- | ------------ | ------- | --------- |
| 1.25 Litre Appachatti (With Glass Lid) | NSA 125G     | 1900    | 8         |
| 2.5 Litre Deep Kadhai (With Glass Lid) | NSDK 25G     | 2650    | 6         |


Sub-Section D: Frying Pan
| Product Name                      | Product Code | MRP (₹) | Case Pack |
| --------------------------------- | ------------ | ------- | --------- |
| 22 cm Frying Pan (Without Lid)    | NSF 22       | 2050    | 6         |
| 22 cm Frying Pan (With Glass Lid) | NSF 22G      | 2350    | 6         |

Section: Hawkins Tri-Ply Stainless Steel
Sub-Section A: Tava
| Product Name                 | Product Code | MRP (₹) | Case Pack |
| ---------------------------- | ------------ | ------- | --------- |
| 22 cm Tava                   | SSTV 22      | 1075    | 10        |
| 26 cm Tava                   | SSTV 26      | 1325    | 10        |
| 24 cm Tava (Rosewood Handle) | SSTV 24      | 1225    | 10        |

Sub-Section B: Deep Fry Pan
| Product Name                            | Product Code | MRP (₹) | Case Pack |
| --------------------------------------- | ------------ | ------- | --------- |
| 1.5 Litre Deep Fry Pan (Without Lid)    | SSD 15       | 1575    | 6         |
| 1.5 Litre Deep Fry Pan (With Glass Lid) | SSD 15G      | 1875    | 6         |
| 2.5 Litre Deep Fry Pan (Without Lid)    | SSD 25       | 1875    | 6         |
| 2.5 Litre Deep Fry Pan (With Glass Lid) | SSD 25G      | 2225    | 6         |
| 4 Litre Deep Fry Pan (Without Lid)      | SSK 40       | 2425    | 3         |
| 4 Litre Deep Fry Pan (With Glass Lid)   | SSK 40G      | 2790    | 3         |
| 5 Litre Deep Fry Pan (Without Lid)      | SSK 50       | 3150    | 3         |
| 5 Litre Deep Fry Pan (With Glass Lid)   | SSK 50G      | 3150    | 3         |

Sub-Section C: Handi
| Product Name                   | Product Code | MRP (₹) | Case Pack |
| ------------------------------ | ------------ | ------- | --------- |
| 2 Litre Handi (With Glass Lid) | SSH 20G      | 2015    | 6         |
| 3 Litre Handi (With Glass Lid) | SSH 30G      | 2250    | 6         |
| 4 Litre Handi (With Glass Lid) | SSH 40G      | 2625    | 6         |
| 5 Litre Handi (With Glass Lid) | SSH 50G      | 3050    | 4         |

Sub-Section D: Frying Pan
| Product Name                      | Product Code | MRP (₹) | Case Pack |
| --------------------------------- | ------------ | ------- | --------- |
| 20 cm Frying Pan (Without Lid)    | SSF 20       | 1350    | 6         |
| 20 cm Frying Pan (With Glass Lid) | SSF 20G      | 1650    | 6         |
| 24 cm Frying Pan (Without Lid)    | SSF 24       | 1595    | 6         |
| 24 cm Frying Pan (With Glass Lid) | SSF 24G      | 1950    | 6         |

Sub-Section E: Tadka Pan (Spice Heating Pan)
| Product Name      | Product Code | MRP (₹) | Case Pack |
| ----------------- | ------------ | ------- | --------- |
| 1.5 Cup Tadka Pan | STP 15       | 490     | 16        |
| 2.5 Cup Tadka Pan | STP 25       | 590     | 12        |

Sub-Section F: Tri-Ply Tpan
| Product Name                            | Product Code | MRP (₹) | Case Pack |
| --------------------------------------- | ------------ | ------- | --------- |
| 1 Litre Tri-Ply Tpan (Without Lid)      | SST 10       | 890     | 9         |
| 1 Litre Tri-Ply Tpan (With Glass Lid)   | SST 10G      | 1025    | 9         |
| 1.5 Litre Tri-Ply Tpan (Without Lid)    | SST 15       | 1025    | 6         |
| 1.5 Litre Tri-Ply Tpan (With Glass Lid) | SST 15G      | 1225    | 6         |
| 2 Litre Tri-Ply Tpan (Without Lid)      | SST 20       | 1225    | 8         |
| 2 Litre Tri-Ply Tpan (With Glass Lid)   | SST 20G      | 1375    | 8         |

Section: Hawkins Aqua
Sub-Section A: Deep Fry Pan Cum Casserole
| Product Name                                        | Product Code | MRP (₹) | Case Pack |
| --------------------------------------------------- | ------------ | ------- | --------- |
| 2 Litre Deep Fry Pan Cum Casserole (With Glass Lid) | IUC 20G      | 2025    | 6         |
| 3 Litre Deep Fry Pan Cum Casserole (With Glass Lid) | IUC 30G      | 2350    | 4         |

Sub-Section B: Baby Casserole
| Product Name                               | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------ | ------------ | ------- | --------- |
| 1.25 Litre Baby Casserole (With Glass Lid) | UBC 125G     | 1325    | 8         |

Section: Hawkins Nonstick Cookware (Gift Items)
Sub-Section A: Grill Pan
| Product Name                     | Product Code | MRP (₹) | Case Pack |
| -------------------------------- | ------------ | ------- | --------- |
| 26 cm Grill Pan (Without Lid)    | IGP 26G      | 1675    | 8         |
| 30 cm Grill Pan (Without Lid)    | DGCP 30      | 1725    | 6         |
| 30 cm Grill Pan (With Glass Lid) | DGCP 30G     | 2100    | 5         |

Sub-Section B: Appe Pan (Paniyarkal)
| Product Name                    | Product Code | MRP (₹) | Case Pack |
| ------------------------------- | ------------ | ------- | --------- |
| 20 cm Appe Pan (With Glass Lid) | NAPE 20G     | 1325    | 8         |
| 24 cm Appe Pan (With Glass Lid) | NAPE 24G     | 1725    | 8         |

Sub-Section C: Multi Snack Pan
| Product Name                           | Product Code | MRP (₹) | Case Pack |
| -------------------------------------- | ------------ | ------- | --------- |
| 30 cm Multi Snack Pan (With Glass Lid) | DCMS 30G     | 1925    | 4         |

Section: Hawkins Futura Tava (Griddles)
Sub-Section A: Hard Anodised Tava
| Product Name                  | Product Code | MRP (₹) | Case Pack |
| ----------------------------- | ------------ | ------- | --------- |
| 22 cm Hard Anodised Tava      | AT 22        | 800     | 16        |
| 24 cm Hard Anodised Tava      | AT 24        | 1000    | 12        |
| 26 cm Hard Anodised Tava      | AT 26        | 1100    | 12        |
| 26 cm Hard Anodised Tava      | AT 26X       | 1225    | 12        |
| 26 cm Hard Anodised Tava      | AT 26XP      | 1225    | 10        |
| 28 cm Hard Anodised Tava      | AT 28        | 1250    | 8         |
| 30 cm Hard Anodised Tava (PH) | AT 30P       | 1475    | 5         |

Sub-Section B: Hard Anodised Roti Tava
| Product Name                              | Product Code | MRP (₹) | Case Pack |
| ----------------------------------------- | ------------ | ------- | --------- |
| 24 cm Hard Anodised Roti Tava (Induction) | IART 24      | 1125    | 12        |
| 26 cm Hard Anodised Roti Tava (Induction) | IART 26      | 1250    | 8         |
| 28 cm Hard Anodised Roti Tava (Induction) | IART 28      | 1425    | 8         |

Sub-Section C: Hard Anodised Flat Tava
| Product Name                              | Product Code | MRP (₹) | Case Pack |
| ----------------------------------------- | ------------ | ------- | --------- |
| 22 cm Hard Anodised Flat Tava             | AFT 22       | 875     | 14        |
| 26 cm Hard Anodised Flat Tava             | AFT 26       | 1200    | 12        |
| 26 cm Hard Anodised Flat Tava (PH)        | AFT 26P      | 1200    | 12        |
| 26 cm Hard Anodised Flat Tava (Induction) | IAFT 26      | 1425    | 12        |

Sub-Section D: Nonstick Tava
| Product Name        | Product Code | MRP (₹) | Case Pack |
| ------------------- | ------------ | ------- | --------- |
| 22 cm Nonstick Tava | NT 22        | 890     | 14        |
| 26 cm Nonstick Tava | NT 26        | 1050    | 12        |

Sub-Section E: Nonstick Dosa Tava
| Product Name                         | Product Code | MRP (₹) | Case Pack |
| ------------------------------------ | ------------ | ------- | --------- |
| 28 cm Nonstick Dosa Tava             | NDT 28       | 1490    | 8         |
| 28 cm Nonstick Dosa Tava (Induction) | INDT 28      | 1700    | 8         |
| 30 cm Nonstick Dosa Tava             | NDT 30       | 1675    | 6         |
| 30 cm Nonstick Dosa Tava (Induction) | INDT 30      | 1875    | 6         |
| 33 cm Nonstick Dosa Tava             | NDT 33       | 1795    | 8         |

Sub-Section F: Nonstick Flat Tava
| Product Name                         | Product Code | MRP (₹) | Case Pack |
| ------------------------------------ | ------------ | ------- | --------- |
| 22 cm Nonstick Flat Tava             | NFT 22       | 1025    | 14        |
| 26 cm Nonstick Flat Tava             | NFT 26       | 1350    | 10        |
| 26 cm Nonstick Flat Tava (PH)        | NFT 26P      | 1350    | 12        |
| 26 cm Nonstick Flat Tava (Induction) | INFT 26      | 1575    | 12        |
| 30 cm Nonstick Flat Tava             | NFT 30       | 1575    | 5         |
| 30 cm Nonstick Flat Tava (PH)        | NFT 30P      | 1575    | 5         |
| 30 cm Nonstick Flat Tava (Induction) | INFT 30      | 1775    | 5         |

Section: Hawkins Futura Hard Anodised Deep-Fry Pans
Sub-Section A: Hard Anodised Deep-Fry Pans (Flat Bottom)
| Product Name                                        | Product Code | MRP (₹) | Case Pack |
| --------------------------------------------------- | ------------ | ------- | --------- |
| 2.5 Litre Hard Anodised Deep Fry Pan (Without Lid)  | ADL 25S      | 2025    | 8         |
| 2.5 Litre Hard Anodised Deep Fry Pan (Without Lid)  | AD 25S       | 2075    | 8         |
| 2.5 Litre Hard Anodised Deep Fry Pan (Without Lid)  | IAD 25S      | 2200    | 8         |
| 3.75 Litre Hard Anodised Deep Fry Pan (Without Lid) | AD 375S      | 2350    | 4         |
| 3.75 Litre Hard Anodised Deep Fry Pan (Without Lid) | IAD 375S     | 2475    | 4         |
| 5 Litre Hard Anodised Deep Fry Pan (Without Lid)    | AD 50S       | 2750    | 4         |
| 7.5 Litre Hard Anodised Deep Fry Pan (Without Lid)  | AD 75S       | 3350    | 3         |

Sub-Section B: Hard Anodised Deep-Fry Pans (With Glass Lid)
| Product Name                                           | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------------ | ------------ | ------- | --------- |
| 2 Litre Hard Anodised Deep Fry Pan (With Glass Lid)    | AD 20G       | 1850    | 8         |
| 3 Litre Hard Anodised Deep Fry Pan (With Glass Lid)    | AD 30G       | 2200    | 6         |
| 3.75 Litre Hard Anodised Deep Fry Pan (With Glass Lid) | AD 375G      | 2600    | 6         |

Section: Hawkins Futura Hard Anodised Kadhai
Sub-Section A: Hard Anodised Kadhai
| Product Name                                     | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------ | ------------ | ------- | --------- |
| 1.5 Litre Hard Anodised Kadhai (Without Lid)     | AK 15        | 1100    | 10        |
| 1.5 Litre Hard Anodised Kadhai (With Steel Lid)  | AK 15S       | 1425    | 10        |
| 2.75 Litre Hard Anodised Kadhai (With Steel Lid) | AK 275S      | 2150    | 4         |
| 4 Litre Hard Anodised Kadhai (With Steel Lid)    | AK 40S       | 2500    | 6         |

Sub-Section B: Hard Anodised Kadhai (With Glass Lid)
| Product Name                                             | Product Code | MRP (₹) | Case Pack |
| -------------------------------------------------------- | ------------ | ------- | --------- |
| 1.5 Litre Hard Anodised Kadhai (With Glass Lid)          | AK 15G       | 1425    | 8         |
| 2 Litre Hard Anodised Kadhai (Induction, With Glass Lid) | IAK 20G      | 1850    | 8         |
| 2.5 Litre Hard Anodised Kadhai (With Glass Lid)          | AFFK 25G     | 1950    | 8         |
| 5 Litre Hard Anodised Kadhai (Induction, With Glass Lid) | IAK 50G      | 2900    | 3         |

Section: Hawkins Futura Nonstick Deep-Fry Pans
Sub-Section A: Nonstick Deep-Fry Pans (Flat Bottom)
| Product Name                                                | Product Code | MRP (₹) | Case Pack |
| ----------------------------------------------------------- | ------------ | ------- | --------- |
| 2 Litre Nonstick Deep Fry Pan (Without Lid)                 | NDL 20       | 1175    | 12        |
| 2 Litre Nonstick Deep Fry Pan (With Steel Lid)              | NDL 20S      | 1495    | 12        |
| 2.5 Litre Nonstick Deep Fry Pan (With Steel Lid)            | ND 25S       | 1925    | 8         |
| 2.5 Litre Nonstick Deep Fry Pan (Induction, With Steel Lid) | IND 25S      | 2050    | 8         |
| 3 Litre Nonstick Deep Fry Pan (Induction, Without Lid)      | INW 30       | 1875    | 6         |
| 3 Litre Nonstick Deep Fry Pan (Induction, With Steel Lid)   | INW 30S      | 2225    | 6         |
| 3.5 Litre Nonstick Deep Fry Pan (With Steel Lid)            | INK 35S      | 2325    | 6         |

Sub-Section B: Nonstick Deep-Fry Pans (With Glass Lid)
| Product Name                                                  | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------------------- | ------------ | ------- | --------- |
| 2 Litre Nonstick Deep Fry Pan (With Glass Lid)                | NDL 20G      | 1495    | 8         |
| 2.5 Litre Nonstick Deep Fry Pan (Induction, With Glass Lid)   | INDK 25G     | 2050    | 8         |
| 2.5 Litre Nonstick Shallow Kadhai (Induction, With Glass Lid) | INSK 25G     | 2050    | 8         |
| 3 Litre Nonstick Deep Fry Pan (Induction, With Glass Lid)     | INK 30G      | 2150    | 4         |
| 5 Litre Nonstick Deep Fry Pan (Induction, With Glass Lid)     | INK 50G      | 2795    | 3         |

Section: Hawkins Futura Nonstick Deep-Fry Pans
Sub-Section C: Nonstick Kadhai / Deep-Fry Pans (Round Bottom)
| Product Name                               | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------ | ------------ | ------- | --------- |
| 1.5 Litre Nonstick Kadhai (Without Lid)    | NK 15        | 1100    | 12        |
| 1.5 Litre Nonstick Kadhai (With Steel Lid) | NK 15S       | 1350    | 12        |
| 2.5 Litre Nonstick Kadhai (Without Lid)    | NK 25        | 1375    | 8         |
| 2.5 Litre Nonstick Kadhai (With Steel Lid) | NK 25S       | 1700    | 8         |
| 4 Litre Nonstick Kadhai (Without Lid)      | NK 40        | 1850    | 8         |
| 4 Litre Nonstick Kadhai (With Steel Lid)   | NK 40S       | 2225    | 8         |

Sub-Section D: Nonstick Appachatti / Breakfast Pan
| Product Name                                   | Product Code | MRP (₹) | Case Pack |
| ---------------------------------------------- | ------------ | ------- | --------- |
| 0.9 Litre Nonstick Appachatti (With Steel Lid) | NBFP 09S     | 1290    | 12        |
| 0.9 Litre Nonstick Appachatti (With Glass Lid) | NBFP 09G     | 1290    | 12        |

Section: Hawkins Futura Frying Pans
Sub-Section A: Hard Anodised Frying Pans
| Product Name                                               | Product Code | MRP (₹) | Case Pack |
| ---------------------------------------------------------- | ------------ | ------- | --------- |
| 17 cm Hard Anodised Frying Pan (Without Lid)               | AF 17        | 850     | 16        |
| 17 cm Hard Anodised Frying Pan (With Steel Lid)            | AF 17S       | 850     | 16        |
| 20 cm Hard Anodised Frying Pan (Without Lid)               | AF 20        | 1000    | 12        |
| 20 cm Hard Anodised Frying Pan (With Steel Lid)            | AF 20S       | 1275    | 12        |
| 20 cm Hard Anodised Frying Pan (Induction, Without Lid)    | IAF 20       | 1125    | 12        |
| 20 cm Hard Anodised Frying Pan (Induction, With Steel Lid) | IAF 20S      | 1400    | 12        |
| 24 cm Hard Anodised Frying Pan (Without Lid)               | AF 24        | 1250    | 12        |
| 24 cm Hard Anodised Frying Pan (With Steel Lid)            | AF 24S       | 1600    | 12        |
| 24 cm Hard Anodised Frying Pan (Induction, Without Lid)    | IAF 24       | 1400    | 12        |
| 24 cm Hard Anodised Frying Pan (Induction, With Steel Lid) | IAF 24S      | 1750    | 12        |
| 29 cm Hard Anodised Frying Pan (Without Lid)               | AF 29        | 1650    | 6         |
| 29 cm Hard Anodised Frying Pan (With Steel Lid)            | AF 29S       | 2050    | 6         |

Sub-Section B: Hard Anodised Frying Pan (With Steel Lid – Rounded Sides)
| Product Name                                                   | Product Code | MRP (₹) | Case Pack |
| -------------------------------------------------------------- | ------------ | ------- | --------- |
| 20 cm Hard Anodised Frying Pan (With Steel Lid, Rounded Sides) | AF 20RS      | 1300    | 12        |

Sub-Section C: Hard Anodised Frying Pan (With Glass Lid)
| Product Name                                    | Product Code | MRP (₹) | Case Pack |
| ----------------------------------------------- | ------------ | ------- | --------- |
| 20 cm Hard Anodised Frying Pan (With Glass Lid) | AF 20G       | 1275    | 10        |

Section: Hawkins Futura Nonstick Frying Pans
Sub-Section A: Nonstick Frying Pans
| Product Name                                          | Product Code | MRP (₹) | Case Pack |
| ----------------------------------------------------- | ------------ | ------- | --------- |
| 17 cm Nonstick Frying Pan (Without Lid)               | NF 17        | 825     | 16        |
| 17 cm Nonstick Frying Pan (With Steel Lid)            | NF 17S       | 1050    | 16        |
| 20 cm Nonstick Frying Pan (Without Lid)               | NF 20        | 950     | 12        |
| 20 cm Nonstick Frying Pan (With Steel Lid)            | NF 20S       | 1200    | 12        |
| 20 cm Nonstick Frying Pan (Induction, Without Lid)    | INF 20       | 1075    | 12        |
| 20 cm Nonstick Frying Pan (Induction, With Steel Lid) | INF 20S      | 1325    | 8         |
| 24 cm Nonstick Frying Pan (Without Lid)               | NF 24        | 1195    | 12        |
| 24 cm Nonstick Frying Pan (With Steel Lid)            | NF 24S       | 1525    | 12        |
| 24 cm Nonstick Frying Pan (Induction, Without Lid)    | INF 24       | 1325    | 12        |
| 24 cm Nonstick Frying Pan (Induction, With Steel Lid) | INF 24S      | 1650    | 12        |
| 28 cm Nonstick Frying Pan (Without Lid)               | NF 28        | 1575    | 4         |
| 28 cm Nonstick Frying Pan (With Steel Lid)            | NF 28S       | 1950    | 4         |
| 29 cm Nonstick Frying Pan (Induction, Without Lid)    | INFS 29      | 1775    | 4         |
| 29 cm Nonstick Frying Pan (Induction, With Steel Lid) | INFS 29S     | 2150    | 4         |


Sub-Section B: Nonstick Frying Pan (Rounded Sides)
| Product Name                                              | Product Code | MRP (₹) | Case Pack |
| --------------------------------------------------------- | ------------ | ------- | --------- |
| 24 cm Nonstick Frying Pan (Rounded Sides, Without Lid)    | NF 24R       | 1275    | 8         |
| 24 cm Nonstick Frying Pan (Rounded Sides, With Steel Lid) | NF 24RS      | 1595    | 8         |

Sub-Section C: Nonstick Frying Pan (With Glass Lid)
| Product Name                                          | Product Code | MRP (₹) | Case Pack |
| ----------------------------------------------------- | ------------ | ------- | --------- |
| 16 cm Nonstick Frying Pan (Induction, Without Lid)    | INF 16       | 865     | 10        |
| 16 cm Nonstick Frying Pan (Induction, With Glass Lid) | INF 16G      | 1095    | 10        |
| 20 cm Nonstick Frying Pan (With Glass Lid)            | NF 20G       | 1225    | 8         |
| 24 cm Nonstick Frying Pan (With Glass Lid)            | NF 24G       | 1525    | 8         |
| 24 cm Nonstick Frying Pan (Induction, With Glass Lid) | INF 24G      | 1650    | 8         |


Section: Hawkins Futura Specialty Pans
Sub-Section A: Hard Anodised Tadka Pans
| Product Name                                 | Product Code | MRP (₹) | Case Pack |
| -------------------------------------------- | ------------ | ------- | --------- |
| 1 Cup Hard Anodised Tadka Pan (Without Lid)  | ATP 1        | 425     | 36        |
| 2 Cups Hard Anodised Tadka Pan (Without Lid) | ATP 2        | 525     | 18        |

Sub-Section B: Nonstick All Purpose Pans
| Product Name                                     | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------ | ------------ | ------- | --------- |
| 2.5 Litre Nonstick All Purpose Pan (Without Lid) | NAP 25       | 1550    | 10        |
| 3 Litre Nonstick All Purpose Pan (Without Lid)   | NAP 30       | 1775    | 8         |

Sub-Section C: Nonstick Curry Pans (Sauté Pans)
| Product Name                                   | Product Code | MRP (₹) | Case Pack |
| ---------------------------------------------- | ------------ | ------- | --------- |
| 2 Litre Nonstick Curry Pan (With Glass Lid)    | NCP 20G      | 1395    | 10        |
| 3.25 Litre Nonstick Curry Pan (With Glass Lid) | NCP 325G     | 1725    | 6         |

Sub-Section D: Nonstick Uttapam Pan
| Product Name                                | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------- | ------------ | ------- | --------- |
| 24 cm Nonstick Uttapam Pan (With Glass Lid) | NUP 24G      | 1700    | 10        |

Section: Hawkins Cook n Serve Stewpots, Bowls & Casseroles
Sub-Section A: Hard Anodised Cook n Serve Bowls
| Product Name                                                     | Product Code | MRP (₹) | Case Pack |
| ---------------------------------------------------------------- | ------------ | ------- | --------- |
| 2 Litre Hard Anodised Cook n Serve Bowl (Without Lid)            | ACB 20       | 1500    | 12        |
| 2 Litre Hard Anodised Cook n Serve Bowl (Induction, Without Lid) | IACB 20      | 1625    | 12        |
| 3 Litre Hard Anodised Cook n Serve Bowl (Without Lid)            | ACB 30       | 1925    | 8         |
| 3 Litre Hard Anodised Cook n Serve Bowl (Induction, Without Lid) | IACB 30      | 2075    | 8         |
| 4 Litre Hard Anodised Cook n Serve Bowl (Without Lid)            | ACB 40       | 2000    | 6         |
| 5 Litre Hard Anodised Cook n Serve Bowl (Without Lid)            | ACB 50       | 2250    | 6         |
| 6 Litre Hard Anodised Cook n Serve Bowl (Without Lid)            | ACB 60       | 2550    | 4         |

Sub-Section B: Hard Anodised Cook n Serve Casserole
| Product Name                                                             | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------------------------------ | ------------ | ------- | --------- |
| 4 Litre Hard Anodised Cook n Serve Casserole (Induction, With Glass Lid) | IACB 40G     | 2200    | 6         |

Sub-Section C: Nonstick Cook n Serve Casseroles
| Product Name                                                        | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------------------------- | ------------ | ------- | --------- |
| 2 Litre Nonstick Cook n Serve Casserole (Induction, With Glass Lid) | INCB 20G     | 1575    | 8         |
| 3 Litre Nonstick Cook n Serve Casserole (Induction, With Glass Lid) | INCB 30G     | 2015    | 8         |
| 5 Litre Nonstick Cook n Serve Casserole (Induction, With Glass Lid) | INCB 50G     | 2575    | 4         |

Sub-Section D: Hard Anodised Stewpots
| Product Name                                   | Product Code | MRP (₹) | Case Pack |
| ---------------------------------------------- | ------------ | ------- | --------- |
| 2.25 Litre Hard Anodised Stewpot (Without Lid) | AST 225      | 1400    | 12        |
| 5 Litre Hard Anodised Stewpot (Without Lid)    | AST 50       | 2375    | 3         |
| 8.5 Litre Hard Anodised Stewpot (Without Lid)  | AST 85       | 3250    | 3         |

Sub-Section E: Hard Anodised Stewpot (With Glass Lid)
| Product Name                                   | Product Code | MRP (₹) | Case Pack |
| ---------------------------------------------- | ------------ | ------- | --------- |
| 5 Litre Hard Anodised Stewpot (With Glass Lid) | AST 50G      | 2375    | 3         |

Sub-Section F: Nonstick Stewpots
| Product Name                              | Product Code | MRP (₹) | Case Pack |
| ----------------------------------------- | ------------ | ------- | --------- |
| 3 Litre Nonstick Stewpot (With Glass Lid) | NST 30G      | 1850    | 8         |
| 5 Litre Nonstick Stewpot (With Glass Lid) | NST 50G      | 2250    | 3         |

Section: Hawkins Futura Hard Anodised Cook n Serve Handi
Sub-Section A: Hard Anodised Cook n Serve Handi
| Product Name                                                         | Product Code | MRP (₹) | Case Pack |
| -------------------------------------------------------------------- | ------------ | ------- | --------- |
| 2 Litre Hard Anodised Cook n Serve Handi (With Glass Lid)            | ACH 20G      | 1625    | 8         |
| 3 Litre Hard Anodised Cook n Serve Handi (With Glass Lid)            | ACH 30G      | 2025    | 8         |
| 3 Litre Hard Anodised Cook n Serve Handi (Induction, With Glass Lid) | IACH 30G     | 2150    | 8         |
| 4 Litre Hard Anodised Cook n Serve Handi (With Glass Lid)            | ACH 40G      | 2175    | 6         |
| 4 Litre Hard Anodised Cook n Serve Handi (Induction, With Glass Lid) | IACH 40G     | 2300    | 6         |
| 5 Litre Hard Anodised Cook n Serve Handi (With Glass Lid)            | ACH 50G      | 2750    | 6         |
| 5 Litre Hard Anodised Cook n Serve Handi (Induction, With Glass Lid) | IACH 50G     | 2950    | 6         |

Section: Hawkins Futura BigBoy Biryani Handi
Sub-Section A: Nonstick BigBoy Biryani Handi
| Product Name                                      | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------- | ------------ | ------- | --------- |
| 8 Litre Nonstick BigBoy Biryani Handi (With Lid)  | NBH 8        | 3525    | 2         |
| 12 Litre Nonstick BigBoy Biryani Handi (With Lid) | NBH 12       | 4390    | 2         |

Sub-Section B: Hard Anodised BigBoy Biryani Handi
| Product Name                                           | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------------ | ------------ | ------- | --------- |
| 8 Litre Hard Anodised BigBoy Biryani Handi (With Lid)  | ABH 8        | 3550    | 2         |
| 12 Litre Hard Anodised BigBoy Biryani Handi (With Lid) | ABH 12       | 4425    | 2         |

Section: Hawkins Futura Hard Anodised Handi Saucepans
| Product Name                                                     | Product Code | MRP (₹) | Case Pack |
| ---------------------------------------------------------------- | ------------ | ------- | --------- |
| 2 Litre Hard Anodised Handi Saucepan (With Lid)                  | AH 20        | 1500    | 9         |
| 3 Litre Hard Anodised Handi Saucepan (With Lid, Long Handle)     | AH 3L        | 1875    | 8         |
| 3 Litre Hard Anodised Handi Saucepan (With Lid, 2 Short Handles) | AH 3S        | 1875    | 5         |

Section: Hawkins Futura Hard Anodised Saucepans
| Product Name                                                 | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------------------ | ------------ | ------- | --------- |
| 1 Litre Hard Anodised Saucepan (Without Lid)                 | AS 10        | 900     | 15        |
| 1 Litre Hard Anodised Saucepan (With Steel Lid)              | AS 10S       | 1050    | 15        |
| 1.5 Litre Hard Anodised Saucepan (Without Lid)               | AS 15        | 1025    | 12        |
| 1.5 Litre Hard Anodised Saucepan (With Steel Lid)            | AS 15S       | 1200    | 12        |
| 1.5 Litre Hard Anodised Saucepan (Induction, Without Lid)    | IAS 15       | 1150    | 12        |
| 1.5 Litre Hard Anodised Saucepan (Induction, With Steel Lid) | IAS 15S      | 1325    | 12        |
| 2 Litre Hard Anodised Saucepan (Induction, Without Lid)      | IAS 20       | 1175    | 12        |
| 2 Litre Hard Anodised Saucepan (Induction, With Steel Lid)   | IAS 20S      | 1425    | 12        |
| 2.25 Litre Hard Anodised Saucepan (Without Lid)              | AS 225       | 1125    | 8         |
| 2.25 Litre Hard Anodised Saucepan (With Steel Lid)           | AS 225S      | 1375    | 8         |

Section: Hawkins Futura Cast Iron Cookware
Sub-Section A: Futura Cast Iron Tava
| Product Name                              | Product Code | MRP (₹) | Case Pack |
| ----------------------------------------- | ------------ | ------- | --------- |
| 22 cm Futura Cast Iron Tava (Without Lid) | CIT 22       | 1450    | 8         |
| 24 cm Futura Cast Iron Tava (Without Lid) | CIT 24       | 1450    | 8         |

Sub-Section B: Futura Cast Iron Square Tava
| Product Name                                     | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------ | ------------ | ------- | --------- |
| 26 cm Futura Cast Iron Square Tava (Without Lid) | CIST 26      | 1975    | 6         |

Sub-Section C: Futura Cast Iron Dosa Tava
| Product Name                                   | Product Code | MRP (₹) | Case Pack |
| ---------------------------------------------- | ------------ | ------- | --------- |
| 27 cm Futura Cast Iron Dosa Tava (Without Lid) | CIDT 27      | 1975    | 6         |

Sub-Section D: Futura Cast Iron Frying Pan
| Product Name                                                          | Product Code | MRP (₹) | Case Pack |
| --------------------------------------------------------------------- | ------------ | ------- | --------- |
| 0.8 Litre Futura Cast Iron Frying Pan (With Glass Lid, Single Handle) | CIF 16G      | 1775    | 6         |
| 1.3 Litre Futura Cast Iron Frying Pan (With Glass Lid, Single Handle) | CIF 20G      | 2225    | 4         |
| 1.8 Litre Futura Cast Iron Frying Pan (With Glass Lid, Two Handles)   | CIF 24G      | 2390    | 4         |

Sub-Section E: Futura Cast Iron Baby Casserole
| Product Name                                                | Product Code | MRP (₹) | Case Pack |
| ----------------------------------------------------------- | ------------ | ------- | --------- |
| 1.25 Litre Futura Cast Iron Baby Casserole (With Glass Lid) | CIC 125G     | 1825    | 4         |

Sub-Section F: Futura Cast Iron Kadhai
| Product Name                                       | Product Code | MRP (₹) | Case Pack |
| -------------------------------------------------- | ------------ | ------- | --------- |
| 1.5 Litre Futura Cast Iron Kadhai (With Glass Lid) | CIK 15G      | 2150    | 4         |
| 2 Litre Futura Cast Iron Kadhai (With Glass Lid)   | CIK 20G      | 2390    | 4         |
| 3.5 Litre Futura Cast Iron Kadhai (With Glass Lid) | CIK 35G      | 3225    | 3         |

Sub-Section G: Futura Cast Iron Appe Pan
| Product Name                                     | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------ | ------------ | ------- | --------- |
| 16 cm Futura Cast Iron Appe Pan (With Glass Lid) | CIAP 16G     | 1795    | 8         |

Section: Hawkins Futura Ironman – Slim Cast Iron
Sub-Section A: Futura Ironman Cast Iron Frying Pan
| Product Name                                            | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------------- | ------------ | ------- | --------- |
| 22 cm Futura Ironman Cast Iron Frying Pan (Without Lid) | IMF 22G      | 2400    | 4         |
| 26 cm Futura Ironman Cast Iron Frying Pan (Without Lid) | IMF 26G      | 2700    | 4         |

Sub-Section B: Futura Ironman Cast Iron Deep Fry Pan
| Product Name                                                  | Product Code | MRP (₹) | Case Pack |
| ------------------------------------------------------------- | ------------ | ------- | --------- |
| 2.5 Litre Futura Ironman Cast Iron Deep Fry Pan (Without Lid) | IMK 25G      | 2975    | 4         |
| 4 Litre Futura Ironman Cast Iron Deep Fry Pan (Without Lid)   | IMK 40G      | 3500    | 4         |

Sub-Section C: Futura Ironman Cast Iron Stir-Fry Wok
| Product Name                                                   | Product Code | MRP (₹) | Case Pack |
| -------------------------------------------------------------- | ------------ | ------- | --------- |
| 4.75 Litre Futura Ironman Cast Iron Stir-Fry Wok (Without Lid) | IMW 475      | 2600    | 3         |

Section: Hawkins Miniature Cooker
| Product Name                           | Product Code | MRP (₹) | Case Pack |
| -------------------------------------- | ------------ | ------- | --------- |
| Hawkins Miniature Cooker (Without Lid) | MIN          | 200     | 32        |

Section: Hawkins Futura Toy Kitchen Set
| Product Name           | Product Code | MRP (₹) | Case Pack |
| ---------------------- | ------------ | ------- | --------- |
| Futura Toy Kitchen Set | CWMN         | 400     | 5         |


