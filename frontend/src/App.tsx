import React from 'react';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

import GlobalStyle from './styles/globals';

const App: React.FC = () => (
   <>
      {/* <SignIn /> */}
      <SignUp />
      <GlobalStyle />
   </>
);

export default App;
