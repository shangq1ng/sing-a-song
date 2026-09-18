use sing_a_song::app;

#[tokio::main]
async fn main() -> anyhow::Result<()>{
    app().await?;
    Ok(())
}