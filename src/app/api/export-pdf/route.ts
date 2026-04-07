import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { ResumeData, TemplateId } from "@/lib/types";

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
];

function findSystemChrome(): string | undefined {
  return CHROME_PATHS.find((p) => existsSync(p));
}

export async function POST(request: NextRequest) {
  try {
    const { resumeData, templateId } = (await request.json()) as {
      resumeData: ResumeData;
      templateId: TemplateId;
    };

    const dataB64 = Buffer.from(JSON.stringify(resumeData)).toString("base64");
    const printUrl = `http://localhost:3000/resume-print?data=${encodeURIComponent(dataB64)}&template=${templateId}`;

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: findSystemChrome(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(printUrl, { waitUntil: "networkidle0" });

    // Wait for React hydration to finish (Suspense renders nothing on SSR)
    await page.waitForFunction(
      () => document.body.scrollHeight > 100,
      { timeout: 5000 }
    );

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "PDF 导出失败" }, { status: 500 });
  }
}
