'use client';

import React from 'react';
import { Card } from '@/components/common';

export const MyRecipes: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Recipe #{i}</h3>
            <p className="text-sm text-gray-600">Created recently</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const Projects: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Projects</h1>
      <Card>
        <p className="text-gray-600 text-center py-12">No projects yet. Create your first project!</p>
      </Card>
    </div>
  );
};

export const Templates: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Templates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <h3 className="font-semibold text-gray-900 mb-2">Template #{i}</h3>
            <p className="text-sm text-gray-600 mb-4">Professional template for your shorts</p>
            <button className="text-blue-500 font-semibold hover:underline">Use Template →</button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const AIAssistant: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Assistant</h1>
      <Card>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              Welcome to AI Assistant! I can help you generate scripts, ideas, and more for your viral content.
            </p>
          </div>
          <textarea
            placeholder="Ask me anything about your content..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">
            Send Message
          </button>
        </div>
      </Card>
    </div>
  );
};

export const Settings: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      <div className="space-y-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="user@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                defaultValue="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">
              Save Changes
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-gray-700">Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-gray-700">Marketing emails</span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
};
