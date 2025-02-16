import LoginForm from "../components/LoginForm";
import TopCryptos from "../components/TopCryptos";

export default function Home() {
  return (
    <div>
      <main className="container mt-5 mb-5">
        <div className="row">
          <div className="col-12 col-md-9  p-3">
            <h1>Dive into Crypto without Risks</h1>
            <h4>Don't know how to start investing in cryptocurrencies? try CryptoDance before using real money!</h4>
          <div>
            <h2 className="my-5">Top 100 Cryptocurrencies by Market Cap</h2>
            <TopCryptos />
          </div>
          
          
          </div>
          <div className="h-50 col-12 col-md-3 p-3 border border rounded border-primary-subtle">
            <div className="">
              <h2 className="mb-4">Login</h2>
              <LoginForm />
            <p className="mt-4">New to CryptoDance? Register <a href="#">here.</a></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
