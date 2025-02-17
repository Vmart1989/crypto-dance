import LoginForm from "../components/LoginForm";
import TopCryptos from "../components/TopCryptos";

export default function Home() {


  return (
    <div>
      <main className="container mt-5 mb-5">
        <div className="row">
          <div className="p-0 col-12 col-md-8 me-5 border rounded border-primary-subtle">
            
          <div>
            
            <TopCryptos />
          </div>
          
          
          </div>
          <div className="h-50 col-12 col-md-3 p-3 border rounded border-primary-subtle">
            <div >
              <h3 className="mb-4">Login to start exploring</h3>
              <LoginForm />
            <p className="mt-4">New to CryptoDance? Register <a href="#">here.</a></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
