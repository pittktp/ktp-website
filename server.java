import java.net.*;
import java.io.*;

public class server {
  public static void main(String[] args)  {
    try {
    ServerSocket serverSock = new ServerSocket(8090);
    Socket clientSock = serverSock.accept();
System.out.println("accepted client connection: " + clientSock);

    InputStream is = clientSock.getInputStream();
    OutputStream os = clientSock.getOutputStream();

    os.write("screw you, asshole".getBytes());
System.out.println("after write...");
    os.flush();
    clientSock.close();

Thread.currentThread().sleep(5000l);
  }
  catch (Throwable t) {
    t.printStackTrace();
  }
  }
}
