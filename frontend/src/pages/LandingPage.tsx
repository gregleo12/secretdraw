import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">SecretDraw</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The smart way to organize Secret Santa and gift exchanges.
            Intelligent matching, automatic exclusions, and hassle-free coordination.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <Link to="/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Automatically handles couples and custom exclusions to ensure fair pairings
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-2">Email Notifications</h3>
              <p className="text-gray-600">
                Participants receive their assignments securely via email
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Mobile Friendly</h3>
              <p className="text-gray-600">
                Works perfectly on all devices, anywhere, anytime
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-primary-100 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6 text-left">
              <div>
                <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2">
                  1
                </div>
                <h4 className="font-semibold mb-1">Create a Group</h4>
                <p className="text-sm text-gray-700">Set up your gift exchange event</p>
              </div>
              <div>
                <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2">
                  2
                </div>
                <h4 className="font-semibold mb-1">Add Participants</h4>
                <p className="text-sm text-gray-700">Invite people and set exclusions</p>
              </div>
              <div>
                <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2">
                  3
                </div>
                <h4 className="font-semibold mb-1">Draw Names</h4>
                <p className="text-sm text-gray-700">Let our algorithm do the matching</p>
              </div>
              <div>
                <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2">
                  4
                </div>
                <h4 className="font-semibold mb-1">Send Notifications</h4>
                <p className="text-sm text-gray-700">Everyone gets their assignment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
