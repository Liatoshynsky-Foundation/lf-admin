import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import PaymentDetailsPageContent from '../../app/(logged_in)/requisites/(components)/PaymentDetailsPageContent';
import { ThemeProvider } from '../../app/providers/ThemeProvider';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: '/api/graphql' })
});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <CssBaseline />
    <ApolloProvider client={client}>
      <PaymentDetailsPageContent />
      <Toaster />
    </ApolloProvider>
  </ThemeProvider>
);
