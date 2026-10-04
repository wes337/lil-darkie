import { NextResponse } from "next/server";
import { GUIDE, JSON_SCHEMAS } from "@/lib/cms/guide";

// Everything a person or an AI assistant needs to write valid records.
export const GET = () => NextResponse.json({ guide: GUIDE, schemas: JSON_SCHEMAS });
