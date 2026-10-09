import { executeCommand } from '../terminalCommands';
import { HOME_SEGMENTS, resolvePath, ROOT_FS, segmentsToPrompt } from '../terminalFs';

export function runTerminalSelfTests(): { name: string; pass: boolean; details?: string }[] {
  const results: { name: string; pass: boolean; details?: string }[] = [];

  let cwd = [...HOME_SEGMENTS]; // /home/jairus
  let oldPwd: string[] | null = null;

  // 1. cd skills
  const step1 = executeCommand('cd skills', cwd, oldPwd, { silent: true });
  if (step1.newCwdSegments && segmentsToPrompt(step1.newCwdSegments) === '~/skills') {
    cwd = step1.newCwdSegments;
    oldPwd = step1.newOldPwdSegments || null;
    results.push({ name: '1. cd skills -> ~/skills', pass: true });
  } else {
    results.push({ name: '1. cd skills -> ~/skills', pass: false, details: JSON.stringify(step1) });
  }

  // 2. ls in ~/skills
  const step2 = executeCommand('ls', cwd, oldPwd);
  if (!step2.isError && typeof step2.output === 'string' && step2.output.includes('programming/')) {
    results.push({ name: '2. ls in ~/skills shows categories', pass: true });
  } else {
    results.push({ name: '2. ls in ~/skills shows categories', pass: false, details: JSON.stringify(step2) });
  }

  // 3. cd programming
  const step3 = executeCommand('cd programming', cwd, oldPwd);
  if (step3.newCwdSegments && segmentsToPrompt(step3.newCwdSegments) === '~/skills/programming') {
    cwd = step3.newCwdSegments;
    oldPwd = step3.newOldPwdSegments || null;
    results.push({ name: '3. cd programming -> ~/skills/programming', pass: true });
  } else {
    results.push({ name: '3. cd programming -> ~/skills/programming', pass: false, details: JSON.stringify(step3) });
  }

  // 4. cd web-development from ~/skills/programming (should fail)
  const step4 = executeCommand('cd web-development', cwd, oldPwd);
  if (step4.isError && typeof step4.output === 'string' && step4.output.includes('no such file or directory')) {
    results.push({ name: '4. cd web-development from programming fails', pass: true });
  } else {
    results.push({ name: '4. cd web-development from programming fails', pass: false, details: JSON.stringify(step4) });
  }

  // 5. cd .. -> back to ~/skills
  const step5 = executeCommand('cd ..', cwd, oldPwd);
  if (step5.newCwdSegments && segmentsToPrompt(step5.newCwdSegments) === '~/skills') {
    cwd = step5.newCwdSegments;
    oldPwd = step5.newOldPwdSegments || null;
    results.push({ name: '5. cd .. -> ~/skills', pass: true });
  } else {
    results.push({ name: '5. cd .. -> ~/skills', pass: false, details: JSON.stringify(step5) });
  }

  // 6. cd backend (inexact shortened name fails)
  const step6 = executeCommand('cd backend', cwd, oldPwd);
  if (step6.isError && typeof step6.output === 'string' && step6.output.includes('no such file or directory')) {
    results.push({ name: '6. cd backend fails (exact match required)', pass: true });
  } else {
    results.push({ name: '6. cd backend fails (exact match required)', pass: false, details: JSON.stringify(step6) });
  }

  // 7. cd backend-database
  const step7 = executeCommand('cd backend-database', cwd, oldPwd);
  if (step7.newCwdSegments && segmentsToPrompt(step7.newCwdSegments) === '~/skills/backend-database') {
    cwd = step7.newCwdSegments;
    oldPwd = step7.newOldPwdSegments || null;
    results.push({ name: '7. cd backend-database works', pass: true });
  } else {
    results.push({ name: '7. cd backend-database works', pass: false, details: JSON.stringify(step7) });
  }

  // 8. cd ../tools
  const step8 = executeCommand('cd ../tools', cwd, oldPwd);
  if (step8.newCwdSegments && segmentsToPrompt(step8.newCwdSegments) === '~/skills/tools') {
    cwd = step8.newCwdSegments;
    oldPwd = step8.newOldPwdSegments || null;
    results.push({ name: '8. cd ../tools works', pass: true });
  } else {
    results.push({ name: '8. cd ../tools works', pass: false, details: JSON.stringify(step8) });
  }

  // 9. cd Python from tools (should fail)
  const step9 = executeCommand('cd Python', cwd, oldPwd);
  if (step9.isError && typeof step9.output === 'string' && step9.output.includes('no such file or directory')) {
    results.push({ name: '9. cd Python from tools fails', pass: true });
  } else {
    results.push({ name: '9. cd Python from tools fails', pass: false, details: JSON.stringify(step9) });
  }

  // 10. cd ../programming && cd Python (should fail with not a directory)
  const step10a = executeCommand('cd ../programming', cwd, oldPwd);
  cwd = step10a.newCwdSegments || cwd;
  const step10b = executeCommand('cd Python', cwd, oldPwd);
  if (step10b.isError && typeof step10b.output === 'string' && step10b.output.includes('not a directory')) {
    results.push({ name: '10. cd Python (file) fails with not a directory', pass: true });
  } else {
    results.push({ name: '10. cd Python (file) fails with not a directory', pass: false, details: JSON.stringify(step10b) });
  }

  // 11. cat Python -> skill card
  const step11 = executeCommand('cat Python', cwd, oldPwd);
  if (step11.isGreen && Array.isArray(step11.output)) {
    results.push({ name: '11. cat Python outputs boxed card', pass: true });
  } else {
    results.push({ name: '11. cat Python outputs boxed card', pass: false, details: JSON.stringify(step11) });
  }

  // 12. cat "Network Security" from cybersecurity
  const step12a = executeCommand('cd ../cybersecurity', cwd, oldPwd);
  cwd = step12a.newCwdSegments || cwd;
  const step12b = executeCommand('cat "Network Security"', cwd, oldPwd);
  if (step12b.isGreen && Array.isArray(step12b.output)) {
    results.push({ name: '12. cat "Network Security" outputs boxed card', pass: true });
  } else {
    results.push({ name: '12. cat "Network Security" outputs boxed card', pass: false, details: JSON.stringify(step12b) });
  }

  // 13. help command removed
  const step13 = executeCommand('help', cwd, oldPwd);
  if (step13.isError && typeof step13.output === 'string' && step13.output.includes('command not found')) {
    results.push({ name: '13. help command removed (command not found)', pass: true });
  } else {
    results.push({ name: '13. help command removed (command not found)', pass: false, details: JSON.stringify(step13) });
  }

  return results;
}
