import React from 'react';

function Header() {
  return (
    <header className="bg-blue-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trello風タスク管理アプリ</h1>
        <div className="flex space-x-4">
          <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">
            設定
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;