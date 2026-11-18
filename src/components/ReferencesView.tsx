import React from 'react';
import { ExternalLink, FolderGit2 } from 'lucide-react';
import { GITHUB_REFERENCE_REPOS } from '../data/defaults';

export const ReferencesView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Open-Source GitHub Reference Repositories
        </h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600">
          Verified public GitHub repositories aligned with your AI Waste Sorting and Classification
          System brief (Python, OpenCV, YOLOv8, TensorFlow Lite, Raspberry Pi, and web dashboard
          architectures). Open each repository README to inspect its source code, configuration
          files, and screenshots.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {GITHUB_REFERENCE_REPOS.map((repo) => (
          <article
            key={repo.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-slate-500 truncate">{repo.ownerRepo}</p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">{repo.title}</h3>
                </div>
                <FolderGit2 className="h-4 w-4 shrink-0 text-slate-400" />
              </div>

              <p className="mt-2 text-xs text-slate-500">{repo.stack}</p>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-700">
                <p>
                  <span className="font-medium text-slate-900">Dashboard & UI:</span>{' '}
                  {repo.dashboardNotes}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Settings & Config:</span>{' '}
                  {repo.settingsNotes}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500 truncate pr-3">
                Brief alignment: {repo.matchesBriefTools.join(' · ')}
              </span>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                Open on GitHub
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
