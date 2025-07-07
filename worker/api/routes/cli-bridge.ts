import { Env } from '../../index';
import * as path from 'path';
import { readCV, evaluateGrades } from '../../../cli/core/processCV';
import { z } from 'zod';
import * as fs from 'fs/promises';
import { GradeSchema } from '../../../types/schemas';

export async function cliRouter(request: Request, env: Env) {
  const url = new URL(request.url);
  const command = url.pathname.replace('/api/cli/', '');
  const searchParams = url.searchParams;

  try {
    if (command === 'match') {
      // Get CV and grades file from query params, or use defaults
      const cvFile = searchParams.get('cv') || 'pasha.txt';
      const gradesFile = searchParams.get('grades') || 'mobile.json';
      const cvPath = path.resolve('data/CVs', cvFile);
      const gradesPath = path.resolve('data/Grades', gradesFile);

      // Read and parse grades
      const raw = await fs.readFile(gradesPath, 'utf-8');
      const parsed = JSON.parse(raw);
      const GradeArraySchema = z.array(GradeSchema);
      const grades = GradeArraySchema.parse(parsed);

      // Read CV
      const textCV = await readCV(cvPath);
      // Evaluate
      const results = await evaluateGrades(grades, textCV);

      return Response.json({
        success: true,
        command: 'match',
        cv: cvFile,
        grades: gradesFile,
        results,
      });
    }

    // Unknown command fallback
    return Response.json({
      success: false,
      error: `Unknown CLI command '${command}'`,
    }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
