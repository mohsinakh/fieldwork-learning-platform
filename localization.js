'use strict';

// Only interface labels pass through this dictionary. Guide prose has its own
// translations; user-entered tasks, applications and form values are excluded.
const interfaceHinglish = {
  "Overview": "Overview",
  "Job-ready playbook": "Job ki taiyari",
  "My study plan": "Mera study plan",
  "Application tracker": "Application tracker",
  "Learning workspace": "Padhai ka workspace",
  "Start with the guide": "Guide se shuru karo",
  "Resume, job search,": "Resume, job search,",
  "and interview advice.": "aur interview ki advice.",
  "Saved on this browser": "Isi browser mein saved",
  "Your progress stays on this device.": "Progress isi device par rahegi.",
  "Workspace": "Workspace",
  "Read the guide": "Guide padho",
  "Search the guide": "Guide mein dhoondo",
  "Skip to content": "Seedhe content par jao",
  "Toggle navigation": "Menu kholo ya band karo",
  "Main navigation": "Main navigation",
  "Footer navigation": "Footer navigation",
  "Playbook": "Playbook",
  "Applications": "Applications",
  "Study plan": "Study plan",
  "Your guides.": "Tumhare guides.",
  "Open the job preparation guide or work through today’s study tasks.": "Job ki taiyari ka guide kholo ya aaj ke study tasks karo.",
  "For freshers and experienced applicants": "Freshers aur experienced applicants ke liye",
  "The job-ready": "Job ki taiyari",
  "playbook.": "ka playbook.",
  "Help with your resume, job search, and interviews.": "Resume, job search aur interview mein madad.",
  "Templates are included in the chapters.": "Templates chapters ke andar hain.",
  "Continue reading": "Padhna jaari rakho",
  "Open guide": "Guide kholo",
  "Download PDF": "PDF download karo",
  "Career preparation": "Job ki taiyari",
  "chapters": "chapters",
  "roles": "roles",
  "interviews": "interviews",
  "offers": "offers",
  "Fresher action checklist": "Freshers ki action checklist",
  "Chapters finished": "Chapters poore hue",
  "Today’s tasks checked": "Aaj ke tasks check kiye",
  "Applications tracked": "Applications track ki",
  "Today’s study tasks": "Aaj ke study tasks",
  "Open study plan": "Study plan kholo",
  "Daily tasks": "Roz ke tasks",
  "2 hours": "2 ghante",
  "Study a concept": "Ek concept padho",
  "Read the explanation, then try an exercise.": "Explanation padho, phir exercise karo.",
  "Improve your work": "Apne kaam ko behtar karo",
  "Update a project or strengthen a resume bullet.": "Project update karo ya resume ka bullet behtar likho.",
  "Review a relevant opening": "Relevant opening dekho",
  "Read the requirements and tailor your application.": "Requirements padho aur application tailor karo.",
  "Job preparation guide": "Job ki taiyari ka guide",
  "Read a chapter, use its checklist, and come back when you need it.": "Chapter padho, checklist use karo aur zaroorat par phir kholo.",
  "Choose a chapter": "Chapter choose karo",
  "Choose chapter": "Chapter choose karo",
  "Guide chapters": "Guide ke chapters",
  "Guide progress": "Guide ki progress",
  "Contents": "Chapters",
  "Sources": "Sources",
  "Templates to save on your phone": "Phone mein save karne wale templates",
  "Copy template": "Template copy karo",
  "Files for this chapter": "Is chapter ki files",
  "Things to do": "Yeh kaam karo",
  "Your checks are saved in this browser.": "Tumhare checks isi browser mein saved hain.",
  "Previous": "Pichhla",
  "Back to overview": "Overview par jao",
  "Next chapter": "Agla chapter",
  "Finish guide": "Guide poora karo",
  "Finish chapter & continue": "Chapter poora karke aage badho",
  "Mark chapter unfinished": "Chapter ko unfinished karo",
  "Mark unfinished": "Unfinished karo",
  "Try a word such as resume, projects, or interviews.": "Resume, projects ya interviews jaisa word try karo.",
  "Close": "Band karo",
  "Close dialog": "Dialog band karo",
  "Daily practice": "Roz ki practice",
  "My study plan.": "Mera study plan.",
  "Check off what you finish. You can add tasks for any date.": "Jo poora ho use check karo. Kisi bhi date ke tasks add kar sakte ho.",
  "Choose study plan date": "Study plan ki date choose karo",
  "tasks completed": "tasks poore hue",
  "New study task": "Naya study task",
  "Add a study task": "Study task add karo",
  "Add study task": "Study task add karo",
  "The three daily prompts repeat each day. Extra tasks belong to the date you choose.": "Teen daily tasks roz repeat hote hain. Extra tasks chosen date par hi dikhte hain.",
  "A two-hour study session": "Do ghante ki padhai",
  "Choose a concept from the requirements of your target roles.": "Target roles ki requirements se ek concept choose karo.",
  "Use it in a project or exercise": "Project ya exercise mein use karo",
  "Build an example, debug a feature, or improve a project.": "Example banao, feature debug karo ya project improve karo.",
  "Explain what you learned": "Jo seekha use samjhao",
  "Close your notes. Explain what you learned and choose your next step.": "Notes band karo. Jo seekha samjhao aur agla step choose karo.",
  "45 MINUTES": "45 MINUTE",
  "20 + 10 MINUTES": "20 + 10 MINUTE",
  "25-minute timer": "25-minute timer",
  "Focus timer": "Focus timer",
  "Set aside 25 minutes for one task. Pause the timer if you need a break.": "Ek task ke liye 25 minute rakho. Break chahiye to timer pause karo.",
  "Focus time remaining": "Bacha hua focus time",
  "Pause session": "Session pause karo",
  "Start a session": "Session shuru karo",
  "Resume session": "Session jaari rakho",
  "Reset": "Reset",
  "Your focus session is running.": "Focus session chal raha hai.",
  "Your job search": "Tumhari job search",
  "Application tracker.": "Application tracker.",
  "Record the roles you apply for and when you want to follow up.": "Apply kiye hue roles aur follow-up dates record karo.",
  "Add application": "Application add karo",
  "Roles you are tracking": "Track kiye hue roles",
  "Currently interviewing": "Interviews chal rahe hain",
  "Offers received": "Offers mile",
  "Keep notes on your resume version and next step.": "Resume version aur agle step ke notes rakho.",
  "Add a role when you find one you want to apply for.": "Apply karne layak role mile to yahan add karo.",
  "Export CSV": "CSV export karo",
  "Role / company": "Role / company",
  "Added": "Add kiya",
  "Status": "Status",
  "Follow up": "Follow-up",
  "Next step / resume": "Agla step / resume",
  "Actions": "Actions",
  "Saved": "Saved",
  "Applied": "Apply kiya",
  "Interview": "Interview",
  "Offer": "Offer",
  "Closed": "Band",
  "No applications yet.": "Abhi koi application nahi hai.",
  "Save an opening here, then update its status as you hear back.": "Opening yahan save karo. Jawab aane par status update karo.",
  "Add an application": "Application add karo",
  "Adding a role here does not apply for the job. Your records stay in this browser; export a copy if you want a backup.": "Yahan role add karne se job par apply nahi hota. Records isi browser mein rehte hain; backup ke liye copy export karo.",
  "Edit application": "Application edit karo",
  "Add the role and any details you want to keep.": "Role aur jo details rakhni hain woh add karo.",
  "Job title": "Job title",
  "Company": "Company",
  "Job posting URL": "Job posting ka URL",
  "Optional · an http or https link": "Optional · http ya https link",
  "Follow-up date": "Follow-up date",
  "Notes / resume version": "Notes / resume version",
  "Cancel": "Cancel",
  "Save application": "Application save karo",
  "Company name": "Company ka naam",
  "e.g. Software Engineer": "Jaise Software Engineer",
  "Resume version, contact details, or the next step": "Resume version, contact details ya agla step",
  "Add both the job title and company.": "Job title aur company dono bharo.",
  "Use a complete http or https job posting URL.": "Poora http ya https job posting URL do.",
  "Application updated.": "Application update ho gayi.",
  "Application saved.": "Application save ho gayi.",
  "Focus session complete. Take a break when you are ready.": "Focus session poora hua. Jab chaho break lo.",
  "Session complete. Take a break, then reset when you are ready.": "Session poora hua. Break lo aur tayyar hone par reset karo.",
  "Template copied. Replace the brackets with your details.": "Template copy hua. Brackets mein apni details bharo.",
  "Select and copy this text": "Yeh text select karke copy karo",
  "Remove this application?": "Yeh application hata dein?",
  "This removes the entry from your personal tracker. It does not withdraw an application submitted to an employer.": "Isse personal tracker ki entry hategi. Employer ko bheji hui application withdraw nahi hogi.",
  "Keep it": "Rehne do",
  "Remove entry": "Entry hatao",
  "Tracker entry removed.": "Tracker ki entry hat gayi.",
  "Application status updated.": "Application ka status update hua.",
  "Chapter marked as finished.": "Chapter poora mark kiya.",
  "Browser storage is unavailable. Changes will last for this session.": "Browser storage available nahi hai. Changes is session tak rahenge.",
  "These pages were checked on 15 November 2026. Job sites can change their filters. Follow the instructions in the listing you are applying to. The study routine and application targets in this guide are suggestions you can adjust.": "Yeh pages 15 November 2026 ko check kiye gaye. Job sites ke filters badal sakte hain. Jis listing par apply kar rahe ho uski instructions follow karo. Study routine aur application targets apne hisaab se badal sakte ho.",
  "Resume checklist": "Resume ki checklist",
  "Check your resume and application before you send them.": "Bhejne se pehle resume aur application check karo.",
  "Project write-up template": "Project likhne ka template",
  "Write down what your project does, what you built, and how you tested it.": "Project kya karta hai, tumne kya banaya aur kaise test kiya, yeh likho.",
  "Application and follow-up messages": "Application aur follow-up messages",
  "Examples for an application email, a referral request, and a follow-up.": "Application email, referral request aur follow-up ke examples.",
  "Phone clipboard application kit": "Phone clipboard application kit",
  "Fill in your own links and introduction, then save them on your phone.": "Apne links aur intro bharo, phir phone mein save karo.",
  "Display preferences": "Display preferences",
  "Dark mode": "Dark mode",
  "Dark": "Dark",
  "Light": "Light",
  "Reading language": "Padhne ki language",
  "Read in Hinglish": "Hinglish mein padho",
  "Loading workspace…": "Workspace load ho raha hai…",
  "The guide could not be loaded": "Guide load nahi ho saka",
  "Open the PDF": "PDF kholo",
  "To preview the files locally, run": "Local preview ke liye chalao",
  "in the project folder and open": "project folder mein, phir kholo"
};
function ui(text) {
  if (preferences.language !== 'hinglish') return text;
  if (Object.hasOwn(interfaceHinglish, text)) return interfaceHinglish[text];
  return text
    .replace(/^(\d+) of (\d+) chapters finished$/, '$2 mein se $1 chapters poore hue')
    .replace(/^(\d+) of (\d+) checked$/, '$2 mein se $1 check kiye')
    .replace(/^(\d+) min read$/, '$1 minute padhai')
    .replace(/^(\d+) \/ (\d+) complete$/, '$1 / $2 poore')
    .replace(/^(\d+) chapters? found for (.+)\.$/, '$2 ke liye $1 chapters mile.')
    .replace(/^You have finished all (\d+) chapters\.$/, 'Tumne saare $1 chapters poore kar liye.')
    .replace(/^Delete task: /, 'Task hatao: ')
    .replace(/^Status for (.+) at (.+)$/, '$2 mein $1 ka status')
    .replace(/^Edit /, 'Edit karo: ')
    .replace(/^Remove /, 'Hatao: ')
    .replace(/^Source (\d+)$/, 'Source $1');
}
const labelOriginals = new WeakMap();
const attributeOriginals = new WeakMap();
function localizeUI(root) {
  const skip = 'script, style, svg, textarea, [data-user-content], [data-guide-content], #language-toggle, #theme-toggle';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest(skip) || !node.textContent.trim()) continue;
    if (!labelOriginals.has(node)) labelOriginals.set(node, node.textContent);
    const original = labelOriginals.get(node);
    node.textContent = original.replace(/^(\s*)([\s\S]*?)(\s*)$/, (_, before, text, after) => before + ui(text) + after);
  }
  for (const el of root.querySelectorAll('[aria-label], [placeholder], [title]')) {
    if (el.closest(skip.replace('textarea, ', ''))) continue;
    let originals = attributeOriginals.get(el);
    if (!originals) {
      originals = {};
      for (const name of ['aria-label', 'placeholder', 'title']) if (el.hasAttribute(name)) originals[name] = el.getAttribute(name);
      attributeOriginals.set(el, originals);
    }
    for (const [name, text] of Object.entries(originals)) el.setAttribute(name, ui(text));
  }
}
